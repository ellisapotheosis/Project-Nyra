'use client';

import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'card' | 'list' | 'chart';
}

export function LoadingSkeleton({ count = 1, variant = 'card' }: LoadingSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg w-1/3"></div>
        <div className="h-40 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="border border-purple-500/20 bg-black/40 rounded-lg p-6 space-y-3">
            <div className="h-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded w-2/3"></div>
            <div className="h-8 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded"></div>
            <div className="h-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
