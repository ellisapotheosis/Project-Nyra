bindkey -e
export KEYTIMEOUT=1

export ORCH_HOST="${ORCH_HOST:-100.64.0.10}"
export ORCH_WIN_USER="${ORCH_WIN_USER:-edane}"
export ORCH_WSL_USER="${ORCH_WSL_USER:-ellisapotheosis}"
export DISTRO="${DISTRO:-Ubuntu-24.04}"

export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"
export LANGUAGE="${LANGUAGE:-en_US:en}"
export COLORTERM="${COLORTERM:-truecolor}"
export NO_TMUX="${NO_TMUX:-1}"

export PATH="$PATH:$HOME/vcpkg"
export PATH="$PATH:/snap/bin"
export PATH="$PATH:/opt/rocm/bin"
export LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}:/opt/rocm/lib"
export HSA_OVERRIDE_GFX_VERSION="${HSA_OVERRIDE_GFX_VERSION:-10.3.0}"
