# LLXPRT_SUBSCRIPTION_BRIDGE.md

## Overview
The LLXPRT Subscription Bridge is a unique Project Nyra service that allows the AI cluster to utilize the subscription-based CLI tool usage (Gemini CLI, Codex CLI, Claude Code) as an inference backend.

## Architecture
1. **Bridge Proxy**: A Node.js service (`services/llxprt-bridge`) that exposes an OpenAI-compatible API.
2. **CLI Execution**: The bridge spawns local CLI processes (`rtk`, `codex`, `jefe`) to process requests.
    - **@vybestack/llxprt-jefe**: Primary orchestrator CLI.
    - **llxprt-code**: Specialized coding and refactoring CLI.
3. **Token Efficiency**: All CLI calls are proxied through **RTK (Rust Token Killer)** to optimize context usage and costs.

## Integration
- **Letta**: Letta uses the LLXPRT bridge as its primary reasoning engine when high-fidelity output is required.
- **Nexus Router**: The bridge is registered as a tool in the Nexus tool-kit.

## Configuration
- **Endpoint**: `http://localhost:8090/v1`
- **Auth**: `LLXPRT_BRIDGE_API_KEY`
- **Models**:
    - `llxprt-codex`: Targets the Codex CLI.
    - `llxprt-gemini`: Targets the Gemini CLI.
    - `llxprt-claude`: Targets Claude Code.

## Safety
The bridge operates in a "Sandbox" mode by default, preventing arbitrary file system mutations unless explicitly allowed by the bridge configuration.
