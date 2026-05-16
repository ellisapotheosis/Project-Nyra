# Bootstrap Integration Visual Guide

> **Visual architecture diagrams** for the bootstrap monorepo integration. Companion document to [BOOTSTRAP-INTEGRATION-PLAN.md](./BOOTSTRAP-INTEGRATION-PLAN.md).

---

## 📊 Before & After Architecture

### Current State (Before Integration)

```mermaid
graph TD
    subgraph "Project-Nyra Monorepo"
        A[apps/ratehunter]
        B[apps/nyra-admin]
        C[apps/projectnyra]
        D[services/quote-api]
        E[packages/types]
        F[packages/utils]
        G[packages/core]
    end

    subgraph "Isolated Bootstrap System"
        H[bootstrap/installer]
        I[installer/types]
        J[installer/components]
        K[installer/services]
    end

    A --> E
    A --> F
    B --> E
    B --> F
    C --> E

    H --> I
    H --> J
    H --> K

    style H fill:#ffcccc
    style I fill:#ffcccc
    style J fill:#ffcccc
    style K fill:#ffcccc

    classDef isolated fill:#ffcccc,stroke:#ff0000,stroke-width:2px
```

**Problems**:

- 🔴 Bootstrap is isolated (red boxes)
- 🔴 Types duplicated between `packages/types` and `installer/types`
- 🔴 No code reuse between installer and other apps
- 🔴 Not part of Turbo build pipeline

---

### Target State (After Integration)

```mermaid
graph TD
    subgraph "Project-Nyra Monorepo"
        A[apps/ratehunter]
        B[apps/nyra-admin]
        C[apps/projectnyra]
        D[apps/installer]

        E[services/quote-api]

        F[packages/types]
        G[packages/utils]
        H[packages/core]
        I[packages/bootstrap-types]
        J[packages/bootstrap-ui]
        K[packages/bootstrap-config]
    end

    A --> F
    A --> G
    B --> F
    B --> G
    B -.->|Future reuse| J
    C --> F

    D --> I
    D --> J
    D --> K
    D --> G

    J --> I
    J --> H
    K --> I
    K --> G

    E -.->|Future validation| K

    style D fill:#ccffcc
    style I fill:#ccffcc
    style J fill:#ccffcc
    style K fill:#ccffcc

    classDef integrated fill:#ccffcc,stroke:#00ff00,stroke-width:2px
    classDef reuse stroke:#0000ff,stroke-width:2px,stroke-dasharray: 5 5
```

**Benefits**:

- ✅ Installer integrated into monorepo (green boxes)
- ✅ Three new shared packages for types, UI, and config
- ✅ Admin dashboard can reuse UI components (blue dashed lines)
- ✅ Backend can use config validators (blue dashed lines)
- ✅ All packages in Turbo build pipeline

---

## 🏗️ Package Dependency Graph

### Detailed Dependencies

```mermaid
graph LR
    subgraph "Applications (apps/)"
        A1[installer]
        A2[nyra-admin]
        A3[webapp]
        A4[ratehunter]
    end

    subgraph "Bootstrap Packages (packages/)"
        B1[bootstrap-types]
        B2[bootstrap-ui]
        B3[bootstrap-config]
    end

    subgraph "Core Packages (packages/)"
        C1[types]
        C2[utils]
        C3[core]
        C4[database]
    end

    subgraph "Services (services/)"
        S1[quote-api]
    end

    A1 --> B1
    A1 --> B2
    A1 --> B3
    A1 --> C2
    A1 --> C3

    A2 -.->|Future| B2
    A2 --> C1
    A2 --> C2

    A3 --> C1
    A3 --> C2

    A4 --> C1
    A4 --> C2

    B2 --> B1
    B2 --> C3

    B3 --> B1
    B3 --> C2

    S1 -.->|Future| B3

    style B1 fill:#ffe6e6
    style B2 fill:#e6f3ff
    style B3 fill:#e6ffe6

    classDef newPkg fill:#fff4e6,stroke:#ff9900,stroke-width:3px
    class B1,B2,B3 newPkg
```

**Legend**:

- 🟠 **Solid lines**: Current dependencies
- 🔵 **Dashed lines**: Future reuse opportunities
- 🟡 **Orange boxes**: New packages created during integration

---

## 🔄 Build Pipeline Flow

### Current Build (Sequential)

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Installer as bootstrap/installer
    participant Monorepo as Monorepo Apps

    Dev->>Installer: cd bootstrap/installer
    Dev->>Installer: npm install
    Dev->>Installer: npm run build
    Note over Installer: ~60s build time
    Installer-->>Dev: ✓ Built

    Dev->>Monorepo: cd ../..
    Dev->>Monorepo: pnpm turbo run build
    Note over Monorepo: ~120s build time
    Monorepo-->>Dev: ✓ Built

    Note over Dev: Total: ~180s (3 minutes)
    Note over Dev: No caching, no parallelism
```

---

### Target Build (Turbo Cached)

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Turbo as Turbo Build System
    participant Types as bootstrap-types
    participant UI as bootstrap-ui
    participant Config as bootstrap-config
    participant Installer as apps/installer

    Dev->>Turbo: pnpm turbo run build

    par Build Types (Parallel)
        Turbo->>Types: tsc build
        Note over Types: ~3s (cached: 0.1s)
        Types-->>Turbo: ✓ Built
    end

    par Build in Parallel
        Turbo->>UI: vite build
        Note over UI: ~5s (cached: 0.2s)
        UI-->>Turbo: ✓ Built
    and
        Turbo->>Config: tsc build
        Note over Config: ~3s (cached: 0.1s)
        Config-->>Turbo: ✓ Built
    end

    Turbo->>Installer: vite + tsc build
    Note over Installer: ~10s (cached: 0.5s)
    Installer-->>Turbo: ✓ Built

    Turbo-->>Dev: ✓ All Built
    Note over Dev: Total: ~20s cold (0.9s cached)
    Note over Dev: 70-90% faster!
```

---

## 📦 Package Structure Visualization

### File System Layout

```
Project-Nyra/
├── apps/
│   ├── installer/                  # 🟢 NEW LOCATION
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── electron.ts
│   │   ├── package.json           # @nyra/installer
│   │   └── vite.config.ts
│   ├── nyra-admin/
│   ├── webapp/
│   └── ratehunter/
│
├── packages/
│   ├── bootstrap-types/           # 🆕 NEW PACKAGE
│   │   ├── src/
│   │   │   ├── manifest.ts
│   │   │   ├── installation.ts
│   │   │   ├── docker.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── bootstrap-ui/              # 🆕 NEW PACKAGE
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── PCSelector.tsx
│   │   │   │   ├── InstallationProgress.tsx
│   │   │   │   └── HealthDashboard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useHardwareDetection.ts
│   │   │   │   └── useInstallState.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── bootstrap-config/          # 🆕 NEW PACKAGE
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   ├── manifest.schema.ts
│   │   │   │   └── docker.schema.ts
│   │   │   ├── validators/
│   │   │   │   ├── fileValidator.ts
│   │   │   │   └── networkValidator.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── core/
│   ├── types/
│   └── utils/
│
└── bootstrap/
    ├── orchestrator-mini/         # PC setup configs
    ├── worker-rtx3090ti/
    ├── README.md
    └── INTEGRATION-QUICKSTART.md
```

**Legend**:

- 🟢 **Moved**: `bootstrap/installer` → `apps/installer`
- 🆕 **New**: Three extracted packages
- 📂 **Unchanged**: Other bootstrap directories remain

---

## 🔀 Data Flow Diagrams

### Type Definitions Flow

```mermaid
flowchart LR
    subgraph "Definition"
        A[packages/bootstrap-types/src/manifest.ts]
        B[packages/bootstrap-types/src/docker.ts]
        C[packages/bootstrap-types/src/installation.ts]
    end

    subgraph "Build"
        D[tsc compile]
        E[dist/manifest.d.ts]
        F[dist/docker.d.ts]
        G[dist/installation.d.ts]
    end

    subgraph "Consumers"
        H[apps/installer]
        I[apps/nyra-admin]
        J[services/quote-api]
        K[packages/bootstrap-ui]
        L[packages/bootstrap-config]
    end

    A --> D
    B --> D
    C --> D

    D --> E
    D --> F
    D --> G

    E --> H
    E --> I
    E --> K
    E --> L

    F --> H
    F --> J

    G --> H
    G --> K

    style A fill:#ffe6e6
    style B fill:#ffe6e6
    style C fill:#ffe6e6
```

---

### Component Reuse Flow

```mermaid
flowchart TD
    A[packages/bootstrap-ui/src/components/]

    B[PCSelector.tsx]
    C[HealthDashboard.tsx]
    D[InstallationProgress.tsx]
    E[DockerSetup.tsx]

    A --> B
    A --> C
    A --> D
    A --> E

    F[vite build --mode lib]

    B --> F
    C --> F
    D --> F
    E --> F

    G[dist/components/]
    F --> G

    H[apps/installer]
    I[apps/nyra-admin]

    G --> H
    G --> I

    H --> J[PC Selection Screen]
    H --> K[Installation Monitor]

    I --> L[Cluster Health Page]
    I --> M[Docker Services Panel]

    style G fill:#e6f3ff
    style H fill:#ccffcc
    style I fill:#ccffcc
```

---

## 🚀 Deployment Pipeline

### CI/CD Workflow

```mermaid
flowchart TD
    A[Git Push] --> B[GitHub Actions]

    B --> C{Changed Files?}

    C -->|bootstrap packages| D[Build bootstrap packages]
    C -->|installer| E[Build installer]
    C -->|other apps| F[Build other apps]

    D --> G[Test bootstrap]
    E --> H[Test installer]
    F --> I[Test other apps]

    G --> J{Tests Pass?}
    H --> J
    I --> J

    J -->|Yes| K[Turbo Cache]
    J -->|No| L[❌ Fail Build]

    K --> M[Package Installer]
    M --> N[Create Artifacts]

    N --> O[Release Notes]
    O --> P[Deploy to GitHub Releases]

    style D fill:#ffe6e6
    style E fill:#ccffcc
    style K fill:#e6f3ff
```

---

## 📈 Performance Comparison

### Build Time Comparison

```mermaid
gantt
    title Build Time: Before vs After Integration
    dateFormat X
    axisFormat %s

    section Before Integration
    npm install (installer): 0, 15
    npm run build (installer): 15, 75
    pnpm install (monorepo): 75, 95
    pnpm turbo run build: 95, 215

    section After Integration (Cold)
    pnpm install: 0, 10
    turbo: bootstrap-types: 10, 13
    turbo: bootstrap-ui & config: 13, 18
    turbo: installer: 18, 28
    turbo: other apps: 28, 40

    section After Integration (Cached)
    pnpm install: 0, 2
    turbo: all cached: 2, 4
```

**Results**:

- **Before**: ~215 seconds (3.6 minutes)
- **After (cold)**: ~40 seconds
- **After (cached)**: ~4 seconds
- **Improvement**: 81% faster cold, 98% faster cached

---

## 🎯 Migration Phases Timeline

```mermaid
gantt
    title Bootstrap Integration Timeline (6 Weeks)
    dateFormat YYYY-MM-DD

    section Planning
    Architecture Design: done, 2026-01-18, 2d
    Team Review & Approval: 2026-01-20, 3d

    section Phase 1: Setup
    Move to apps/: 2026-01-23, 1d
    Update package.json: 2026-01-23, 4h
    Verify installer works: 2026-01-23, 2h

    section Phase 2: Extract Types
    Create bootstrap-types: 2026-01-24, 1d
    Copy & organize types: 2026-01-24, 4h
    Update imports: 2026-01-25, 4h
    Test compilation: 2026-01-25, 2h

    section Phase 3: Extract UI
    Create bootstrap-ui: 2026-01-26, 1d
    Move components: 2026-01-26, 4h
    Configure Vite: 2026-01-27, 2h
    Update imports: 2026-01-27, 4h
    Test hot-reload: 2026-01-27, 2h

    section Phase 4: Extract Config
    Create bootstrap-config: 2026-01-28, 1d
    Extract validators: 2026-01-28, 4h
    Create schemas: 2026-01-29, 4h
    Update imports: 2026-01-29, 2h

    section Phase 5: Turbo
    Update turbo.json: 2026-01-30, 2h
    Test builds: 2026-01-30, 2h
    Optimize caching: 2026-01-30, 2h

    section Phase 6: Testing
    Regression testing: 2026-01-31, 2d
    Performance benchmarks: 2026-02-01, 1d
    Bug fixes: 2026-02-02, 1d

    section Documentation
    Update READMEs: 2026-02-03, 1d
    Create guides: 2026-02-04, 1d
    Team training: 2026-02-05, 4h

    section Deployment
    Merge to main: milestone, 2026-02-06, 0d
    Monitor production: 2026-02-06, 1w
```

---

## 🔍 Component Extraction Map

### What Gets Extracted

```mermaid
mindmap
  root((Bootstrap Installer))
    Types Package
      PCRole, PCId
      BootstrapManifest
      InstallState
      DockerContainer
      MCPServer
      CloudflareTunnel
    UI Package
      Selectors
        PCSelector
        ComponentSelector
        EnvironmentSelector
      Setup Wizards
        DockerSetup
        MCPServerManager
        CloudflareTunnelSetup
        TailscaleSetup
      Monitoring
        InstallationProgress
        HealthDashboard
        GPUWorkersPanel
      Configuration
        ConfigurationEditor
        ShimGenerator
      Hooks
        useHardwareDetection
        useInstallState
        useDockerStatus
    Config Package
      Schemas
        manifestSchema
        dockerSchema
        mcpSchema
      Validators
        validateManifest
        validateNetwork
        validateHardware
      Parsers
        parseManifest
        parseEnvFile
```

---

## 📚 Import Path Changes

### Before Integration

```typescript
// Old import paths
import { PCRole } from "./types/manifest";
import { PCSelector } from "./components/PCSelector";
import { validateManifest } from "./services/validator";
```

### After Integration

```typescript
// New import paths
import { PCRole } from "@nyra/bootstrap-types";
import { PCSelector } from "@nyra/bootstrap-ui/components";
import { validateManifest } from "@nyra/bootstrap-config/validators";
```

### Auto-Import Configuration

```json
// tsconfig.json - paths for IDE autocomplete
{
  "compilerOptions": {
    "paths": {
      "@nyra/bootstrap-types": ["./packages/bootstrap-types/src"],
      "@nyra/bootstrap-ui": ["./packages/bootstrap-ui/src"],
      "@nyra/bootstrap-ui/*": ["./packages/bootstrap-ui/src/*"],
      "@nyra/bootstrap-config": ["./packages/bootstrap-config/src"],
      "@nyra/bootstrap-config/*": ["./packages/bootstrap-config/src/*"]
    }
  }
}
```

---

## 🎨 Component Library Preview

### Storybook Integration (Future)

```mermaid
flowchart LR
    A[packages/bootstrap-ui/] --> B[.storybook/]

    B --> C[stories/]
    C --> D[PCSelector.stories.tsx]
    C --> E[HealthDashboard.stories.tsx]
    C --> F[InstallationProgress.stories.tsx]

    B --> G[npm run storybook]
    G --> H[http://localhost:6006]

    H --> I[Component Playground]
    I --> J[Props Documentation]
    I --> K[Visual Testing]
    I --> L[Accessibility Checks]

    style B fill:#ff4785
    style H fill:#ff4785
```

---

## 📊 Success Metrics Dashboard

```mermaid
graph LR
    subgraph "Build Performance"
        A[Cold Build: 20s]
        B[Cached Build: 0.9s]
        C[CI/CD: 2min]
    end

    subgraph "Code Quality"
        D[0 Duplicated Types]
        E[2+ Apps Reuse]
        F[5 Duplicate Deps]
    end

    subgraph "Developer Experience"
        G[Hot Reload: 200ms]
        H[Type Check: 5s]
        I[Single Command]
    end

    style A fill:#90EE90
    style B fill:#90EE90
    style C fill:#90EE90
    style D fill:#90EE90
    style E fill:#90EE90
    style F fill:#FFD700
    style G fill:#90EE90
    style H fill:#90EE90
    style I fill:#90EE90
```

**Legend**:

- 🟢 **Green**: Target achieved
- 🟡 **Yellow**: Acceptable but can improve

---

## 🔗 Quick Links

- [Full Implementation Plan](./BOOTSTRAP-INTEGRATION-PLAN.md) - 50+ page detailed guide
- [Quick Start Guide](../../bootstrap/INTEGRATION-QUICKSTART.md) - 90-minute implementation
- [ADR-001](./adr/ADR-001-bootstrap-monorepo-integration.md) - Architecture decision record
- [Bootstrap README](../../bootstrap/README.md) - Bootstrap system overview

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-18
**Maintainer**: System Architecture Team
