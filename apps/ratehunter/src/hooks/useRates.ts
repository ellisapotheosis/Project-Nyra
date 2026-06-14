"use client";

import { useState, useEffect } from "react";

export interface LenderRate {
  id: string;
  name: string;
  rate: number;
  apr: number;
  monthly: number;
  points: number;
  closingCosts: number;
  loanType: string;
}

const BASE_RATES: LenderRate[] = [
  {
    id: "rocket",
    name: "Rocket Mortgage",
    rate: 6.875,
    apr: 7.12,
    monthly: 2847,
    points: 0.5,
    closingCosts: 4200,
    loanType: "Conv 30yr",
  },
  {
    id: "wells",
    name: "Wells Fargo",
    rate: 6.75,
    apr: 7.01,
    monthly: 2820,
    points: 0.25,
    closingCosts: 3800,
    loanType: "Conv 30yr",
  },
  {
    id: "chase",
    name: "Chase",
    rate: 6.625,
    apr: 6.89,
    monthly: 2793,
    points: 0,
    closingCosts: 3500,
    loanType: "Conv 30yr",
  },
  {
    id: "better",
    name: "Better.com",
    rate: 6.5,
    apr: 6.74,
    monthly: 2766,
    points: 0,
    closingCosts: 2900,
    loanType: "FHA 30yr",
  },
  {
    id: "uwm",
    name: "UWM",
    rate: 6.375,
    apr: 6.61,
    monthly: 2739,
    points: 0.5,
    closingCosts: 3200,
    loanType: "VA 30yr",
  },
  {
    id: "loandepot",
    name: "loanDepot",
    rate: 7.0,
    apr: 7.24,
    monthly: 2874,
    points: 0.75,
    closingCosts: 4500,
    loanType: "Conv 30yr",
  },
  {
    id: "pennymac",
    name: "PennyMac",
    rate: 6.875,
    apr: 7.09,
    monthly: 2847,
    points: 0.5,
    closingCosts: 4100,
    loanType: "Conv 30yr",
  },
  {
    id: "freedom",
    name: "Freedom",
    rate: 6.75,
    apr: 6.98,
    monthly: 2820,
    points: 0,
    closingCosts: 3600,
    loanType: "USDA",
  },
];

export function useRates(live = false): {
  rates: LenderRate[];
  best: LenderRate | null;
} {
  const [rates, setRates] = useState<LenderRate[]>(BASE_RATES);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setRates((prev) =>
        prev.map((r) => ({
          ...r,
          rate: parseFloat((r.rate + (Math.random() - 0.5) * 0.012).toFixed(3)),
        }))
      );
    }, 4000);
    return () => clearInterval(id);
  }, [live]);

  const best =
    rates.length > 0 ? rates.reduce((a, b) => (a.rate < b.rate ? a : b)) : null;
  return { rates, best };
}
