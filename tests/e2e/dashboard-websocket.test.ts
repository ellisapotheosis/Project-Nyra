import { test, expect } from '@playwright/test';
import WebSocket from 'ws';

test.describe('Dashboard WebSocket Connectivity', () => {
  const EVENT_SERVER_URL = process.env.EVENT_SERVER_URL || 'ws://localhost:3004';
  const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3003';

  test('dashboard can connect to event server', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(DASHBOARD_URL);

    // Intercept WebSocket connection
    const wsPromise = new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(EVENT_SERVER_URL);

      ws.on('open', () => {
        resolve(ws);
      });

      ws.on('error', (error) => {
        reject(error);
      });
    });

    // Wait for WebSocket to establish connection
    const ws = await wsPromise;
    expect(ws.readyState).toBe(WebSocket.OPEN);

    // Send a test event
    const testEvent = {
      type: 'test_connection',
      data: { message: 'E2E WebSocket test' }
    };

    // Wait for event to be processed
    await new Promise<void>((resolve) => {
      ws.send(JSON.stringify(testEvent), () => {
        resolve();
      });
    });

    // Close WebSocket
    ws.close();
  });

  test('dashboard displays real-time events', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(DASHBOARD_URL);

    // Create WebSocket connection
    const wsPromise = new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(EVENT_SERVER_URL);

      ws.on('open', () => {
        resolve(ws);
      });

      ws.on('error', (error) => {
        reject(error);
      });
    });

    const ws = await wsPromise;

    // Wait for dashboard to connect
    await page.waitForSelector('[data-testid="websocket-status"]');

    // Check initial WebSocket connection status
    const connectionStatus = await page.textContent('[data-testid="websocket-status"]');
    expect(connectionStatus).toContain('Connected');

    // Send a test event
    const testEvent = {
      type: 'dashboard_test_event',
      data: { 
        message: 'E2E Real-time Test', 
        timestamp: Date.now() 
      }
    };

    // Wait for event to be sent
    await new Promise<void>((resolve) => {
      ws.send(JSON.stringify(testEvent), () => {
        resolve();
      });
    });

    // Check if event appears in dashboard
    const eventElement = await page.waitForSelector(`[data-testid="event-${testEvent.type}"]`);
    const eventText = await eventElement.textContent();
    
    expect(eventText).toContain(testEvent.data.message);

    // Verify event details
    const eventTimestamp = await page.textContent(`[data-testid="event-timestamp-${testEvent.type}"]`);
    expect(eventTimestamp).toBeTruthy();

    // Close WebSocket
    ws.close();
  });

  test('dashboard handles WebSocket reconnection', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(DASHBOARD_URL);

    // Wait for initial WebSocket connection
    await page.waitForSelector('[data-testid="websocket-status"]');

    // Verify initial connection
    let connectionStatus = await page.textContent('[data-testid="websocket-status"]');
    expect(connectionStatus).toContain('Connected');

    // Simulate WebSocket disconnection (this would be handled by server/client logic)
    await page.evaluate(() => {
      // Simulate WebSocket close
      const ws = (window as any).websocketConnection;
      if (ws) ws.close();
    });

    // Wait for reconnection status
    await page.waitForSelector('[data-testid="websocket-status"]', { 
      state: 'attached',
      timeout: 10000 
    });

    // Check reconnection status
    connectionStatus = await page.textContent('[data-testid="websocket-status"]');
    expect(connectionStatus).toContain('Reconnecting');

    // Wait for reconnection
    await page.waitForSelector('[data-testid="websocket-status"]', { 
      state: 'attached',
      timeout: 10000 
    });

    connectionStatus = await page.textContent('[data-testid="websocket-status"]');
    expect(connectionStatus).toContain('Connected');
  });
});
