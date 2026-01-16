/**
 * PC Detection Hook
 * React hook for detecting current PC type
 */

import { useState, useEffect } from 'react';
import { PCId } from '../types/manifest';
import { PCDetector, PCDetectionResult } from '../services/pcDetector';

export interface UsePCDetectionResult {
  detectionResult: PCDetectionResult | null;
  isDetecting: boolean;
  error: Error | null;
  redetect: () => Promise<void>;
  manualOverride: (pcId: PCId) => void;
}

export const usePCDetection = (): UsePCDetectionResult => {
  const [detectionResult, setDetectionResult] = useState<PCDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const detectPC = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const result = await PCDetector.detect();
      setDetectionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown detection error'));
    } finally {
      setIsDetecting(false);
    }
  };

  const manualOverride = (pcId: PCId) => {
    if (detectionResult) {
      setDetectionResult({
        ...detectionResult,
        detectedPC: pcId,
        confidence: 100, // Manual override = 100% confidence
      });
    }
  };

  useEffect(() => {
    detectPC();
  }, []);

  return {
    detectionResult,
    isDetecting,
    error,
    redetect: detectPC,
    manualOverride,
  };
};
