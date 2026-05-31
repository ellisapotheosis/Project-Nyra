"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  { value: "midnight-mint", label: "Midnight Mint", color: "oklch(0.8871 0.1828 166.5465)" },
  { value: "neon-violet", label: "Neon Violet", color: "oklch(0.5038 0.2937 285.3753)" },
  { value: "cosmic-purple", label: "Cosmic Purple", color: "oklch(0.5038 0.2937 285.3753)" },
  { value: "astral-indigo", label: "Astral Indigo", color: "oklch(0.5038 0.2937 285.3753)" },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-[140px]">
        <span className="sr-only">Loading theme</span>
      </Button>
    )
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: currentTheme.color }}
          />
          <span className="font-mono text-xs">{currentTheme.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className="gap-2"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            <span className="font-mono text-xs">{t.label}</span>
            {theme === t.value && (
              <span className="ml-auto text-primary">&#10003;</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
