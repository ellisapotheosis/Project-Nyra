# Imported Components from Claude Flow UI

This directory contains components extracted and adapted from claude-flow-ui-main for use in Project Nyra's Nexus Dashboard.

## Components

### PerformanceMonitor
- Monitors browser performance metrics (CPU, memory, network)
- Adapted for OKLCH color scheme
- Compatible with React 19 and Next.js 15

### ErrorBoundary
- React error boundary component with enhanced error handling
- Production-ready with fallback UI
- Accessibility compliant

### Terminal Components
- Terminal display and control components
- WebSocket-based real-time terminal
- Adapted for Nexus Dashboard architecture

### Sidebar Components
- Collapsible sidebar with session management
- Terminal list and controls
- Auth integration ready

### Tab Components
- Tab navigation for multiple sessions
- Closable tabs with keyboard support
- Accessible ARIA labels

## Usage

Import components as needed:

```typescript
import { PerformanceMonitor } from '@/components/imported/PerformanceMonitor';
import { ErrorBoundary } from '@/components/imported/ErrorBoundary';
```

## Customization

All components use Tailwind CSS classes and support the Nyra OKLCH color scheme through CSS variables defined in `globals.css`.

## See Also

- [Integration Guide](../../../docs/development/CLAUDE-FLOW-UI-EXTRACTION.md)
- [Component API Reference](../../../docs/components/imported-components.md)
