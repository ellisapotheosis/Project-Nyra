# Claude Flow Event Server

## Overview

The Claude Flow Event Server is a WebSocket-based real-time event streaming service for the Live Operations Dashboard. It provides a centralized event hub for tracking agent lifecycle, task execution, message passing, topology changes, and memory operations.

## Features

- Real-time WebSocket event broadcasting
- Event buffering and replay for new clients
- Configurable event filtering
- Health check endpoint
- Supports multiple event types:
  - Agent Events
  - Task Events
  - Message Events
  - Memory Events
  - Topology Events
  - System Events

## Configuration

Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

### Environment Variables

- `EVENT_SERVER_HOST`: Bind address (default: 0.0.0.0)
- `EVENT_SERVER_PORT`: WebSocket server port (default: 3004)
- `EVENT_SERVER_MAX_CONNECTIONS`: Maximum WebSocket connections
- `EVENT_SERVER_REPLAY_BUFFER`: Number of events to buffer for new clients
- `DEBUG`: Enable debug logging

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## Event Types

### Agent Events
- Spawn
- Status Update
- Completion
- Error

### Task Events
- Start
- Progress
- Completion
- Error

### Message Events
- Inter-Agent Messages
- System Messages

### Memory Events
- Read
- Write
- Eviction

### Topology Events
- Node Addition/Removal
- Edge Addition/Removal

## WebSocket Client Usage

```typescript
const ws = new WebSocket('ws://localhost:3004');

ws.onopen = () => {
  // Optional: Send subscription request
  ws.send(JSON.stringify({ type: 'subscribe', events: ['agent', 'task'] }));
};

ws.onmessage = (event) => {
  const eventData = JSON.parse(event.data);
  console.log('Received event:', eventData);
};
```

## Health Check

HTTP health check available at `http://localhost:3005/health`

## Docker

Dockerfile and docker-compose configuration included for containerized deployment.