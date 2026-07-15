# Wave AI LLxprt Zellij Bootstrap Manifest

## Repo Files

- `repo-files/LLXPRT.md`
- `repo-files/Makefile`
- `repo-files/config/agents/llxprt-settings.project-nyra.json`
- `repo-files/config/agents/llxprt-profiles.json`
- `repo-files/config/agents/llxprt-env.example`
- `repo-files/config/agents/llxprt-profiles/*.json`
- `repo-files/config/agents/letta-stack-orchestrator.json`
- `repo-files/infra/configs/waveterm/*`
- `repo-files/infra/configs/zellij/nyra-wave-ai*.kdl`
- `repo-files/infra/configs/zellij/nyra-orchestrator-mcp.kdl`
- `repo-files/infra/configs/zellij/nyra-swarm.kdl`
- `repo-files/scripts/*wave*`
- `repo-files/scripts/*zellij*`
- `repo-files/scripts/*llxprt*`
- `repo-files/scripts/*jefe*`
- `repo-files/docs/infra/WAVE_LLXPRT_BOOTSTRAP_PACKAGE.md`
- `repo-files/docs/infra/WAVE_ZELLIJ_AGENT_STACK.md`

## Home Config Snapshots

- `home-config/waveterm/`: current installed WaveTerm settings, Wave AI modes, presets, keybindings, and theme files.
- `home-config/llxprt/profiles/`: current installed LLxprt profile JSON files.
- `home-config/llxprt/settings.json`: current non-secret LLxprt provider/model settings.
- `home-config/llxprt/settings.project-nyra.bootstrap.json`: repo-generated non-secret LLxprt settings template.
- `home-config/llxprt/nyra-auth.todo`: interactive OAuth/keyring checklist.

Letta is represented by `repo-files/config/agents/letta-stack-orchestrator.json`.
It is a non-secret orchestration profile that points Letta at the LLxprt bridge,
Nexus, OpenClaw lanes, and memory services. Runtime tokens must still come from
Infisical, keyring auth, or the host environment.

## Dotfiles

- `dotfiles/.zshrc`: current modular zsh entrypoint.
- `dotfiles/zsh/*.zsh`: current non-secret zsh modules.
- `dotfiles/zsh/85-wave-llxprt.zsh`: Wave/Zellij/LLxprt helper functions and aliases.
- `dotfiles/zsh/99-nyra-wave-env.zsh.template`: endpoint and secret placeholder template.

The real `~/.zsh/99-secrets.zsh` is intentionally excluded because it contains live secrets.

## Local Source Reference

- `external/llxprt-jefe/`: local LLxprt Jefe source checkout copied without `.git` or `target/` build artifacts.

LLxprt Code is npm-resolved by `@vybestack/llxprt-code`; the package intentionally stores profile/config/bootstrap files rather than vendoring npm cache contents.

## Operational Tools

- `bin/nyra-wave-control.sh`: single command router for install, check, doctor, snapshot, profiles, blackbox, and launch.
- `bin/nyra-wave-doctor.sh`: full local package and stack validator.
- `bin/snapshot-live-config.sh`: safe copy-based package refresher from current live state.
- `bin/llxprt-profile-matrix.sh`: profile inventory and optional `--load` validation.
- `bin/package-blackbox.sh`: redacted support archive generator.
- `blackbox/.gitkeep`: keeps the archive output directory present without committing generated archives.
