#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Review and (optionally) merge open pull requests for a GitHub repository.

Usage:
  review-and-merge-prs.sh [--repo owner/name] [--merge] [--dry-run] [--show-blockers]

Environment:
  GITHUB_TOKEN       Required for authenticated requests and merging
  GITHUB_REPOSITORY  Optional default repo in owner/name format

Options:
  --repo       Repository in owner/name format (overrides GITHUB_REPOSITORY)
  --merge      Merge eligible PRs using squash strategy
  --dry-run    Print what would happen without merging
  --show-blockers  Print actionable comment/review blockers per PR
  -h, --help   Show this help
USAGE
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

die() {
  echo "ERROR: $*" >&2
  exit 1
}

api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"

  if [[ -n "$data" ]]; then
    curl -fsSL -X "$method" \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      "https://api.github.com${path}" \
      -d "$data"
  else
    curl -fsSL -X "$method" \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      "https://api.github.com${path}"
  fi
}

graphql() {
  local query="$1"
  local variables="$2"

  curl -fsSL -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    "https://api.github.com/graphql" \
    -d "$(jq -cn --arg query "$query" --argjson variables "$variables" '{query:$query,variables:$variables}')"
}

graphql_unresolved_thread_count() {
  local owner="$1"
  local repo_name="$2"
  local pr_number="$3"
  local query='
    query($owner:String!, $repo:String!, $number:Int!, $after:String) {
      repository(owner:$owner, name:$repo) {
        pullRequest(number:$number) {
          reviewThreads(first:100, after:$after) {
            nodes {
              isResolved
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }'
  local after='null'
  local unresolved=0

  while :; do
    local variables response page_count has_next end_cursor
    variables="$(jq -cn \
      --arg owner "$owner" \
      --arg repo "$repo_name" \
      --argjson number "$pr_number" \
      --argjson after "$after" \
      '{owner:$owner,repo:$repo,number:$number,after:$after}')"
    response="$(graphql "$query" "$variables")"

    jq -e '.errors | not' >/dev/null <<<"$response" || \
      die "GraphQL reviewThreads query failed for PR #${pr_number}: $(jq -c '.errors' <<<"$response")"

    jq -e '.data.repository.pullRequest != null' >/dev/null <<<"$response" || \
      die "GraphQL reviewThreads query returned no pull request data for PR #${pr_number}"

    page_count="$(jq '[.data.repository.pullRequest.reviewThreads.nodes[]? | select(.isResolved == false)] | length' <<<"$response")"
    unresolved=$((unresolved + page_count))
    has_next="$(jq -r '.data.repository.pullRequest.reviewThreads.pageInfo.hasNextPage // false' <<<"$response")"
    if [[ "$has_next" != "true" ]]; then
      break
    fi
    end_cursor="$(jq -r '.data.repository.pullRequest.reviewThreads.pageInfo.endCursor // empty' <<<"$response")"
    [[ -n "$end_cursor" ]] || die "Missing endCursor while paginating review threads for PR #${pr_number}"
    after="$(jq -Rn --arg cursor "$end_cursor" '$cursor')"
  done

  echo "$unresolved"
}

REPO="${GITHUB_REPOSITORY:-}"
DO_MERGE="false"
DRY_RUN="false"
SHOW_BLOCKERS="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      if [[ $# -lt 2 || "${2:-}" == --* ]]; then
        echo "Missing value for --repo (expected owner/name)." >&2
        usage >&2
        exit 1
      fi
      REPO="${2:-}"
      shift 2
      ;;
    --merge)
      DO_MERGE="true"
      shift
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --show-blockers)
      SHOW_BLOCKERS="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_cmd curl
require_cmd jq

if [[ -z "$REPO" ]]; then
  die "Repository not set. Use --repo owner/name or set GITHUB_REPOSITORY."
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  die "GITHUB_TOKEN is required."
fi

[[ "$REPO" =~ ^[^/]+/[^/]+$ ]] || die "Repository must be in owner/name format: ${REPO}"
owner="${REPO%%/*}"
repo_name="${REPO#*/}"

echo "Scanning open PRs for ${REPO}..."
open_prs="$(api GET "/repos/${REPO}/pulls?state=open&per_page=100")"
count="$(jq 'length' <<<"$open_prs")"
echo "Open PRs: ${count}"

if [[ "$count" -eq 0 ]]; then
  echo "No open PRs to review."
  exit 0
fi

for pr in $(jq -r '.[].number' <<<"$open_prs"); do
  pr_data="$(api GET "/repos/${REPO}/pulls/${pr}")"
  title="$(jq -r '.title' <<<"$pr_data")"
  draft="$(jq -r '.draft' <<<"$pr_data")"
  mergeable_state="$(jq -r '.mergeable_state // "unknown"' <<<"$pr_data")"
  requested_reviewers_count="$(jq -r '(.requested_reviewers | length) + (.requested_teams | length)' <<<"$pr_data")"

  reviews="$(api GET "/repos/${REPO}/pulls/${pr}/reviews")"
  review_state="$(jq -r '
    sort_by(.submitted_at // "9999-12-31T23:59:59Z")
    | reduce .[] as $r ({};
        .[
          if ($r.user.login // "") != "" then $r.user.login
          else "__review_id_" + (($r.id // "unknown") | tostring)
          end
        ] = $r.state
      )
    | [.[]]
    | if any(. == "CHANGES_REQUESTED") then "CHANGES_REQUESTED"
      elif any(. == "APPROVED") then "APPROVED"
      else "PENDING_REVIEW" end
  ' <<<"$reviews")"

  issue="$(api GET "/repos/${REPO}/issues/${pr}")"
  comments="$(jq -r '.comments' <<<"$issue")"
  review_comments="$(jq -r '.review_comments' <<<"$issue")"

  unresolved_threads="$(graphql_unresolved_thread_count "$owner" "$repo_name" "$pr")"

  blockers="()"
  if [[ "$SHOW_BLOCKERS" == "true" ]]; then
    blockers="$(jq -r '
      [ .[] | select(.state == "CHANGES_REQUESTED")
        | {user: (.user.login // "unknown"), state: .state, submitted_at: (.submitted_at // "n/a"), body: (.body // "")}
      ]
      | map("\(.user) [\(.state)] @ \(.submitted_at): " + ((.body | gsub("\\s+";" ") | .[0:120]) // ""))
      | if length == 0 then "()" else .[] end
    ' <<<"$reviews")"
  fi

  echo ""
  echo "#${pr} ${title}"
  echo "  draft=${draft} mergeable_state=${mergeable_state} review_state=${review_state} requested_reviewers=${requested_reviewers_count} unresolved_threads=${unresolved_threads} comments=${comments} review_comments=${review_comments}"
  if [[ "$SHOW_BLOCKERS" == "true" && "$blockers" != "()" ]]; then
    echo "  blockers:"
    while IFS= read -r blocker; do
      echo "    - ${blocker}"
    done <<<"$blockers"
  fi

  can_merge="false"
  if [[ "$draft" == "false" \
    && "$mergeable_state" == "clean" \
    && "$review_state" != "CHANGES_REQUESTED" \
    && "$requested_reviewers_count" -eq 0 \
    && "$unresolved_threads" -eq 0 ]]; then
    can_merge="true"
  fi

  if [[ "$DO_MERGE" == "true" ]]; then
    if [[ "$can_merge" == "true" ]]; then
      if [[ "$DRY_RUN" == "true" ]]; then
        echo "  dry-run: would merge #${pr}"
      else
        merge_payload="$(jq -cn --arg method "squash" --arg title "Merge PR #${pr}: ${title}" '{merge_method:$method,commit_title:$title}')"
        api PUT "/repos/${REPO}/pulls/${pr}/merge" "$merge_payload" >/dev/null
        echo "  merged #${pr}"
      fi
    else
      echo "  skipped: not merge-eligible"
    fi
  fi
done
