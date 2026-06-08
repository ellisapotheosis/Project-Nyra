# Spec: Z-Drive Prompt Pack Reconciliation

## Objective

Integrate the mounted-drive prompt pack into Conductor, compare it with the existing v3 import, and execute all runnable prompting without reintroducing deprecated architecture.

## Findings

The mounted Z-drive May 26 copy contains the same file set as the prior import. Its only detected content delta is in Prompt 01, where the stack list referenced the retired workspace name instead of the active `Gastown` workspace.

## Decision

Raw prompt provenance is preserved exactly. Executable Project Nyra truth remains:

- Gastown is the active operator workspace.
- Do not reintroduce the retired workspace as active infrastructure.
- UI/theme prompt 08 was executed only through the explicitly assigned safe slice: dependency validation plus theme registry/provider/switcher.
- Owner-gated live checks remain open.
