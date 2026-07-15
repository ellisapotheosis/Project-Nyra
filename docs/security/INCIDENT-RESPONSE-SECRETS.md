# Secret Incident Response

Use this when a secret may have been committed, logged, exposed in a public bind, or copied into a tracked file.

## Immediate response

1. Stop further commits on the affected branch.
2. Identify the affected secret name, file, and scope.
3. Remove the value from the tracked file or config.
4. Rotate the secret at the source of truth.
5. Replace the value in Infisical or the approved runtime secret backend.
6. Re-run `scripts/security/nyra-secret-scan.sh --staged`.
7. Recommit only the sanitized change.

## Containment

- If the secret was committed, treat the remote branch as compromised until rotated.
- If the secret was printed to logs, scrub the logs and rotate.
- If the secret was exposed through a public port, close the bind first, then rotate.

## History cleanup

Use the safest practical history-rewrite path for the repo:

- `git filter-repo` if available
- scoped branch rebuild if the leak is isolated
- repository admin cleanup if a remote mirror exists

Do not rewrite history blindly. Confirm the scope before removing paths from history.

## Verification

After remediation:

- re-run the staged scanner
- re-run the repo audit
- confirm the affected service starts with the rotated secret
- confirm no secret value appears in logs, commit diffs, or env templates

## Operator note

If a task requires dashboard access, MFA, or vendor login, record the step in the operator manual and continue with the safe local work.
