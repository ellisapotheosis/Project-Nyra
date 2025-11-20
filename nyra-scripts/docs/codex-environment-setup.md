# Project Nyra Codex Environment Setup

Use these scripts to prepare Windows/WSL/Linux environments for browser-based or VS Code development and for headless AI-driven automation.

## Scripts
- `nyra-scripts/codex-env-setup.ps1` – Windows 11/PowerShell bootstrap. Installs Git, Node.js LTS + pnpm, Python 3.11 + uv, and (optionally) Docker Desktop + VS Code Remote Containers support.
- `nyra-scripts/codex-env-setup.sh` – WSL/Linux bootstrap. Installs Git, Node.js LTS + pnpm, Python + uv, and optional Docker tooling.

### Common usage
```powershell
# Windows (elevated PowerShell)
./nyra-scripts/codex-env-setup.ps1 -DevContainer
```
```bash
# WSL/Linux
./nyra-scripts/codex-env-setup.sh --devcontainer
```
Flags:
- Dev container setup: `-DevContainer` (PowerShell) / `--devcontainer` (bash)
- Headless/automation: `-AiRunner` / `--ai-runner`
- Skip language installs: `-NoNode`, `-NoPython` / `--no-node`, `--no-python`

After the bootstrap completes, run inside the repo:
```bash
pnpm install
uv sync
```

## VS Code Dev Container
1. Copy `nyra-scripts/devcontainer/` to `.devcontainer/` at the repo root.
2. Install the VS Code extension `ms-vscode-remote.remote-containers`.
3. Run “Dev Containers: Reopen in Container”. The template installs Node LTS, Python 3.11, uv, and pnpm, then executes `pnpm install && uv sync`.

## AI/Headless runner image
The devcontainer Dockerfile doubles as a fast base image for CI/AI runners. Build it from the repo root:
```bash
docker build -f nyra-scripts/devcontainer/Dockerfile -t project-nyra-ai .
```
Then mount the repo in your automation stack:
```bash
docker run --rm -it -v "$PWD":/workspace/Project-Nyra project-nyra-ai
```

## Working across Windows and WSL
- **Copying or cloning the repo**: Prefer cloning directly inside WSL (e.g., `~/projects/Project-Nyra`) to avoid NTFS performance penalties.
- **Viewing files from Windows**: In WSL, run `explorer.exe .` to open the current directory in File Explorer, or navigate to `\\wsl$\\<distro>\home\<user>\projects\Project-Nyra` from Windows.
- **Editing with VS Code**: Install the “WSL” extension and use `code .` from inside WSL; it keeps paths consistent without symlinks.
- **Syncing with Windows editors**: If you must share, use the WSL path via `\\wsl$` rather than symlinking into `C:\` to avoid path breakage and case-sensitivity issues.

## Browser-based workflows
Running the scripts ensures Node, pnpm, Python, and uv are ready so ChatGPT/Codex can install dependencies with `pnpm install` and `uv sync`. For long-lived browser sessions, favor the devcontainer image to ensure consistent tooling.
