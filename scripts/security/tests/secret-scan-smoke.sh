#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SCANNER="$ROOT/scripts/security/nyra-secret-scan.sh"

tmpdir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmpdir"
}
trap cleanup EXIT

cd "$tmpdir"
git init -q
git config user.name "Nyra Security Test"
git config user.email "nyra-security-test@example.com"

mkdir -p .git/hooks
cat > .git/hooks/pre-commit <<EOF
#!/usr/bin/env bash
set -euo pipefail
exec "$SCANNER" --staged
EOF
chmod 755 .git/hooks/pre-commit

printf 'safe baseline\n' > safe.txt
git add safe.txt
git commit -m "safe baseline" >/dev/null

printf 'OPENAI_API_KEY=sk-ant-%s\n' "$(openssl rand -hex 18)" > canary.env
git add canary.env
if git commit -m "canary leak" >/tmp/nyra-secret-scan-canary.log 2>&1; then
  echo "expected commit to fail for canary secret"
  exit 1
fi
echo "canary blocked"
sed -n '1,12p' /tmp/nyra-secret-scan-canary.log
rm -f /tmp/nyra-secret-scan-canary.log

git reset --hard HEAD >/dev/null
rm -f canary.env

printf 'notes only\n' > clean.txt
git add clean.txt
git commit -m "clean pass" >/dev/null

echo "secret-scan-smoke: pass"
