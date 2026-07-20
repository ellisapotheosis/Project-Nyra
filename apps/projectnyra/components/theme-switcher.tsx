"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = [
  {
    value: "void",
    label: "Void",
    color: "oklch(0.5038 0.2937 285.3753)",
  },
  {
    value: "mint-midnight",
    label: "Mint Midnight",
    color: "oklch(0.8871 0.1828 166.5465)",
  },
  {
    value: "mint-midnight-glow",
    label: "Mint Midnight Glow",
    color: "oklch(0.60 0.18 166)",
  },
  {
    value: "azure",
    label: "Azure",
    color: "oklch(0.71 0.14 237)",
  },
  {
    value: "indigo",
    label: "Indigo",
    color: "oklch(0.598 0.185 279)",
  },
  {
    value: "shadowpriest",
    label: "Shadowpriest",
    color: "oklch(0.60 0.225 306)",
  },
  {
    value: "holographic",
    label: "Holographic",
    color: "#00d9ff",
  },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-[9rem]" aria-hidden>
        <span className="sr-only">Loading theme</span>
      </Button>
    );
  }

  const currentTheme = themes.find((item) => item.value === theme) ?? themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-[10rem] gap-2 overflow-hidden"
        >
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: currentTheme.color }}
          />
          <span className="truncate font-mono text-xs">
            {currentTheme.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => setTheme(item.value)}
            className="gap-2"
          >
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-mono text-xs">{item.label}</span>
            {theme === item.value ? (
              <Check className="ml-auto size-3.5 text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
