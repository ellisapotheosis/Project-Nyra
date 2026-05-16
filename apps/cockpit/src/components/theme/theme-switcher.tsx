"use client";

import { Check } from "lucide-react";

import { Button } from "@nyra/ui";
import { NYRA_THEMES } from "@/lib/themes/registry";
import { useNyraTheme } from "@/lib/themes/theme-provider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useNyraTheme();

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {NYRA_THEMES.map((item) => {
        const selected = item.id === theme;

        return (
          <Button
            key={item.id}
            type="button"
            variant={selected ? "default" : "outline"}
            className="h-auto justify-start gap-3 p-4 text-left"
            onClick={() => setTheme(item.id)}
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current">
              {selected ? <Check className="size-3" /> : null}
            </span>
            <span>
              <span className="block text-xs font-black uppercase tracking-widest">{item.label}</span>
              <span className="mt-1 block text-[11px] font-medium normal-case text-current/70">
                {item.role}
              </span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
