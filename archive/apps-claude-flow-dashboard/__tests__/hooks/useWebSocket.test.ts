import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import useWebSocket from '../../src/hooks/useWebSocket';

describe('useWebSocket Hook', () => {
  let mockSocket: {
    send: vi.Mock,
    close: vi.Mock,
    addEventListener: vi.Mock,
    removeEventListener: vi.Mock,
    readyState: number
  };

  beforeEach(() => {
    // Mock WebSocket
    mockSocket = {
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: WebSocket.OPEN
    };

    vi.stubGlobal('WebSocket', vi.fn().mockImplementation(() => mockSocket));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should connect to WebSocket on initialization', () => {
    const url = 'ws://localhost:3004';
    const { result } = renderHook(() => useWebSocket(url));

    expect(WebSocket).toHaveBeenCalledWith(url);
  });

  it('should send messages through WebSocket', () => {
    const url = 'ws://localhost:3004';
    const { result } = renderHook(() => useWebSocket(url));

    const testMessage = { type: 'test', data: 'hello' };
    act(() => {
      result.current.sendMessage(testMessage);
    });

    expect(mockSocket.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
  });

  it('should handle incoming messages', () => {
    const url = 'ws://localhost:3004';
    const onMessage = vi.fn();
    const { result } = renderHook(() => useWebSocket(url, onMessage));

    const testEvent = {
      data: JSON.stringify({ type: 'event', data: 'test data' })
    };

    // Simulate message event
    const messageHandler = mockSocket.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )[1];

    messageHandler(testEvent);

    expect(onMessage).toHaveBeenCalledWith({ type: 'event', data: 'test data' });
  });

  it('should handle connection and disconnection', () => {
    const url = 'ws://localhost:3004';
    const { result, unmount } = renderHook(() => useWebSocket(url));

    // Check connection event listener
    expect(mockSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
    expect(mockSocket.addEventListener).toHaveBeenCalledWith('close', expect.any(Function));

    // Unmount should close the connection
    act(() => {
      unmount();
    });

    expect(mockSocket.close).toHaveBeenCalled();
  });

  it('should handle WebSocket errors', () => {
    const url = 'ws://localhost:3004';
    const onError = vi.fn();
    const { result } = renderHook(() => useWebSocket(url, undefined, onError));

    const errorEvent = new Error('Connection failed');
    const errorHandler = mockSocket.addEventListener.mock.calls.find(
      call => call[0] === 'error'
    )[1];

    errorHandler(errorEvent);

    expect(onError).toHaveBeenCalledWith(errorEvent);
  });

  it('should attempt reconnection on unexpected close', () => {
    vi.useFakeTimers();

    const url = 'ws://localhost:3004';
    const { result } = renderHook(() => useWebSocket(url));

    // Simulate an unexpected close event
    const closeHandler = mockSocket.addEventListener.mock.calls.find(
      call => call[0] === 'close'
    )[1];

    // Create a close event that simulates an unexpected disconnect
    const closeEvent = {
      wasClean: false,
      code: 1006,
      reason: ''
    };

    closeHandler(closeEvent);

    // Advance timers to trigger reconnection
    vi.runAllTimers();

    // Verify that a new WebSocket was created
    expect(WebSocket).toHaveBeenCalledTimes(2);
  });
});
