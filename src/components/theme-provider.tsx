
"use client"

import * as React from "react"

type Theme = "retro" | "modern";

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "modern",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "modern",
  storageKey = "vite-ui-theme",
  ...props
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    }
    return defaultTheme
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("theme-retro", "theme-modern");
    root.classList.add(`theme-${theme}`);
    
    if (theme === 'retro') {
      root.style.fontFamily = '"Press Start 2P", cursive';
    } else {
      root.style.fontFamily = '"Inter", sans-serif';
    }
  }, [theme]);


  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, theme)
      }
      setTheme(theme)
    },
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
