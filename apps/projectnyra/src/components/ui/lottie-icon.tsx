"use client";

import Lottie from "lottie-react";

interface LottieIconProps {
  animationData: object;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function LottieIcon({
  animationData,
  size = 24,
  loop = true,
  autoplay = true,
  className,
  "aria-label": ariaLabel,
}: LottieIconProps) {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={className}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        aria-label={ariaLabel}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
