#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Review and (optionally) merge open pull requests for a GitHub repository.

Usage:
  review-and-merge-prs.sh [--repo owner/name] [--merge] [--dry-run]

Environment:
  GITHUB_TOKEN       Required for authenticated requests and merging
  GITHUB_REPOSITORY  Optional default repo in owner/name format

Options:
  --repo       Repository in owner/name format (overrides GITHUB_REPOSITORY)
  --merge      Merge eligible PRs using squash strategy
  --dry-run    Print what would happen without merging
  -h, --help   Show this help
USAGE
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
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

REPO="${GITHUB_REPOSITORY:-}"
DO_MERGE="false"
DRY_RUN="false"

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
  echo "Repository not set. Use --repo owner/name or set GITHUB_REPOSITORY." >&2
  exit 1
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_TOKEN is required." >&2
  exit 1
fi

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

  reviews="$(api GET "/repos/${REPO}/pulls/${pr}/reviews")"
  review_state="$(jq -r '
    [.[].state]
    | if any(. == "CHANGES_REQUESTED") then "CHANGES_REQUESTED"
      elif any(. == "APPROVED") then "APPROVED"
      else "PENDING_REVIEW" end
  ' <<<"$reviews")"

  issue="$(api GET "/repos/${REPO}/issues/${pr}")"
  comments="$(jq -r '.comments' <<<"$issue")"
  review_comments="$(jq -r '.review_comments' <<<"$issue")"

  echo ""
  echo "#${pr} ${title}"
  echo "  draft=${draft} mergeable_state=${mergeable_state} review_state=${review_state} comments=${comments} review_comments=${review_comments}"

  can_merge="false"
  if [[ "$draft" == "false" && "$mergeable_state" == "clean" && "$review_state" != "CHANGES_REQUESTED" ]]; then
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
