# Nyra Stack and Infrastructure Reference

This document summarises the roles of various machines and the high‑level deployment patterns for Project Nyra.

## Topology Overview
Project Nyra consists of a **control plane** and a **compute plane**. The control plane runs on two hosts: one local orchestrator and one cloud host. The compute plane uses a small number of GPU workers.

- **Control plane (local):** Handles routing, memory aggregation, monitoring and exposes services to the public. It runs tools like the Nexus router, a model router, an observability stack and the assistant gateway【263234951327427†L46-L55】.
- **Control plane (cloud):** Hosts durable services such as the CRM, workflow glue, source control and databases【263234951327427†L31-L35】【263234951327427†L56-L62】.
- **Compute plane:** Composed of a primary and secondary heavy‑model worker and a utility worker for smaller models【263234951327427†L37-L42】.

## Deployment Patterns
- Use per‑machine Docker Compose files stored under the infrastructure directory; do not place runtime compose files elsewhere【423519143471560†L4-L29】.
- Validate each machine with baseline checks (OS updates, container runtime, GPU availability, connectivity)【423519143471560†L12-L17】.
- Assign services consistently: heavy models run on heavy workers; small models run on the utility worker; the orchestrator runs control‑plane services; the cloud host runs durable services【423519143471560†L18-L29】.

## Networking & Exposure
- Machines communicate over a private network with automatic hostnames【263234951327427†L64-L67】.
- Only control‑plane hosts expose public services; restrict public exposure to designated subdomains and protect sensitive surfaces【263234951327427†L66-L68】【263234951327427†L95-L99】.

## Operational Guidance
- Use a terminal multiplexer and consistent tooling for development workflows.
- Monitor services with the observability stack and maintain health checks.

Refer to this document when provisioning or adjusting infrastructure for Project Nyra.
