#!/usr/bin/env bash
set -euo pipefail

pkg_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repo_root="$(cd "${pkg_dir}/../.." && pwd)"

usage() {
  cat <<'EOF'
Nyra Wave Control

Usage:
  nyra-wave-control.sh install        Install repo files and home config from this package
  nyra-wave-control.sh check          Validate package, repo configs, scripts, and layouts
  nyra-wave-control.sh doctor         Run the full stack doctor
  nyra-wave-control.sh snapshot       Refresh package copies from current live repo/home state
  nyra-wave-control.sh profiles       Print LLxprt profile matrix
  nyra-wave-control.sh profiles-load  Print profile matrix and check llxprt profile loading
  nyra-wave-control.sh blackbox       Create a redacted support archive
  nyra-wave-control.sh launch         Launch default Nyra Wave/Zellij cockpit
  nyra-wave-control.sh launch-3060    Launch cockpit with worker-rtx3060 pane
EOF
}

cmd="${1:-help}"
shift || true

case "$cmd" in
  install)
    bash "${pkg_dir}/install.sh" "$@"
    ;;
  check)
    bash "${pkg_dir}/install.sh" --check
    ;;
  doctor)
    bash "${pkg_dir}/bin/nyra-wave-doctor.sh" "$@"
    ;;
  snapshot)
    bash "${pkg_dir}/bin/snapshot-live-config.sh" "$@"
    ;;
  profiles)
    bash "${pkg_dir}/bin/llxprt-profile-matrix.sh" "$@"
    ;;
  profiles-load)
    bash "${pkg_dir}/bin/llxprt-profile-matrix.sh" --load "$@"
    ;;
  blackbox)
    bash "${pkg_dir}/bin/package-blackbox.sh" "$@"
    ;;
  launch)
    (cd "$repo_root" && bash scripts/nyra-wave-zellij.sh "$@")
    ;;
  launch-3060)
    (cd "$repo_root" && NYRA_INCLUDE_3060=1 bash scripts/nyra-wave-zellij.sh "$@")
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
