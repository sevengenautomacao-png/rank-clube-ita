
"use client"

import * as React from "react"

type Theme = "theme-dark" | "theme-light" | "theme-retro-dark" | "theme-retro-light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  fontClassName: string
}

const initialState: ThemeProviderState = {
  theme: "theme-dark",
  setTheme: () => null,
  fontClassName: "font-modern",
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "theme-dark",
  storageKey = "vite-ui-theme",
  attribute = "class",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  const [fontClassName, setFontClassName] = React.useState("font-modern")

  React.useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [storageKey]);

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("theme-light", "theme-dark", "theme-retro-light", "theme-retro-dark")
    root.classList.add(theme)
    setFontClassName(theme.includes("retro") ? "font-retro" : "font-modern")
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    fontClassName
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
