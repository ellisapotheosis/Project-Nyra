"use client";

import dynamic from "next/dynamic";

export const ParticleFieldWrapper = dynamic(
  () => import("./particle-field").then((m) => ({ default: m.ParticleField })),
  { ssr: false }
);
