'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TerminalDimensions {
  cols: number;
  rows: number;
  width: number;
  height: number;
}

interface UseTerminalResizeOptions {
  charWidth?: number;
  charHeight?: number;
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  minCols?: number;
  minRows?: number;
  maxCols?: number;
  maxRows?: number;
  debounceMs?: number;
  onDimensionChange?: (dimensions: TerminalDimensions) => void;
}

export function useTerminalResize(
  containerRef: React.RefObject<HTMLElement>,
  options: UseTerminalResizeOptions = {}
) {
  const {
    charWidth = 8,
    charHeight = 16,
    padding = { top: 0, bottom: 0, left: 0, right: 0 },
    minCols = 40,
    minRows = 10,
    maxCols = 200,
    maxRows = 100,
    debounceMs = 100,
    onDimensionChange,
  } = options;

  const [dimensions, setDimensions] = useState<TerminalDimensions>({
    cols: 80,
    rows: 24,
    width: 0,
    height: 0,
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDimensions = useCallback(
    (containerWidth: number, containerHeight: number): TerminalDimensions => {
      const horizontalPadding = (padding.left || 0) + (padding.right || 0);
      const verticalPadding = (padding.top || 0) + (padding.bottom || 0);

      const availableWidth = Math.max(0, containerWidth - horizontalPadding);
      const availableHeight = Math.max(0, containerHeight - verticalPadding);

      let cols = Math.floor(availableWidth / charWidth);
      let rows = Math.floor(availableHeight / charHeight);

      cols = Math.max(minCols, Math.min(maxCols, cols));
      rows = Math.max(minRows, Math.min(maxRows, rows));

      return {
        cols,
        rows,
        width: containerWidth,
        height: containerHeight,
      };
    },
    [charWidth, charHeight, padding, minCols, minRows, maxCols, maxRows]
  );

  const handleResize = useCallback(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newDimensions = calculateDimensions(rect.width, rect.height);
      setDimensions(newDimensions);

      if (onDimensionChange) {
        onDimensionChange(newDimensions);
      }
    };

    if (debounceMs > 0) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(updateDimensions, debounceMs);
    } else {
      updateDimensions();
    }
  }, [containerRef, calculateDimensions, debounceMs, onDimensionChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // Initial calculation
    handleResize();

    return () => {
      resizeObserver.disconnect();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [containerRef, handleResize]);

  return { dimensions };
}
