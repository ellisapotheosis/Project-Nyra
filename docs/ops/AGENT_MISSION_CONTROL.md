# AGENT_MISSION_CONTROL.md

## Overview
Project Nyra includes a "Mission Control" layer for managing the AI cluster's goals, safety, and physical resources.

## 1. Goal Alignment (Paperclip)
- **Primary Goal**: Broker efficiency and lead conversion.
- **Secondary Goal**: 100% regulatory compliance.
- **Mechanism**: Agents report their "Proposed Actions" to the Mission Control layer for risk scoring before execution.

## 2. Cluster Visibility
- **Fleet Dashboard**: Real-time observability of GPU workers.
- **Node Affinity**: Mission Control assigns high-reasoning tasks to the 5090 worker and background tasks to the 3060.

## 3. Human-in-the-loop (HITL)
- **Threshold**: Any action with a risk level of `BORROWER_COMMUNICATION` or higher triggers a HITL event.
- **Interface**: Proposals appear as cards in the **Assistant Cockpit** and **Nerve UI**.
- **Audit**: All human decisions are logged with a `SYSTEM_BROKER` performer tag.

## 4. Hardware Management
- **Inference Ingress**: Managed via LiteLLM and Nexus Router.
- **Thermal Policy**: Mission Control monitors worker node status (`ONLINE`, `BUSY`, `OFFLINE`) to prevent GPU overload.
