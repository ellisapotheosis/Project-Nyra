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
import { resolveTheme, themes } from "@/config/themes";

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

  const resolvedTheme = resolveTheme(theme);
  const currentTheme =
    themes.find((item) => item.value === resolvedTheme) ?? themes[0];

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
            {resolvedTheme === item.value ? (
              <Check className="ml-auto text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
