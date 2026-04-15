"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative p-2 rounded-sm bg-surface-lowest border border-border/10 hover:bg-surface-high transition-all text-muted-foreground hover:text-primary group flex items-center justify-center h-9 w-9"
      aria-label="Toggle theme"
    >
      <div className="relative h-[18px] w-[18px]">
        <Sun className="absolute inset-0 h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:scale-110" />
        <Moon className="absolute inset-0 h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:scale-110" />
      </div>
    </button>
  )
}
