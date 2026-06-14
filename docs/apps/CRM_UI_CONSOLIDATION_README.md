# CRM & UI Consolidation Index

This directory centralizes all documentation regarding Twenty CRM integration, UI requirements for various applications, and overall project goals.

## 📁 Structure

- **[crm-docs/](./crm-docs/)**: Everything related to Twenty CRM.
  - `CRM_REQUIREMENTS.md`: Functional and technical CRM requirements.
  - `twenty-crm-readme.md`: Setup and integration guide for Twenty CRM.
  - `crm-integration.md`: Architecture of the CRM bridge.
- **[ui-docs/](./ui-docs/)**: Requirements and documentation for UI components.
  - `webapp-readme.md`: Documentation for the main borrower/broker webapp.
  - `admin-readme.md`: Documentation for the admin/operator dashboard.
  - `NYRA_ASSISTANT_FEATURES.md`: Requirements for the AI assistant and Chat UI.
  - `ui_registry.md`: Registry of all UI endpoints and services.
- **[project-goals/](./project-goals/)**: High-level strategic documentation.
  - `BUSINESS_GOALS.md`: Core business drivers for Project Nyra.
  - `global-project-contract.md`: The `AGENTS.md` file acting as the primary contract.
  - `MORTGAGE_DOMAIN.md`: Domain-specific knowledge and terminology.
  - `WHITEPAPER.md`: Comprehensive vision for the platform.

## 🎯 Project Goals
- Automate the mortgage lead lifecycle.
- Provide a high-compliance, AI-powered borrower experience.
- Maintain a stable control plane (orchestrator) with replaceable compute (workers).
- Ensure a unified design language (shadcn + Magic UI) across all surfaces.
