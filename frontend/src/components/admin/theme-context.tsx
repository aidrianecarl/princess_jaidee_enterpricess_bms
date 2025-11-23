"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin_theme") as Theme | null

    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initial = prefersDark ? "dark" : "light"
      setTheme(initial)
      applyTheme(initial)
    }
  }, [])

  const applyTheme = (t: Theme) => {
    const html = document.documentElement
    if (t === "dark") html.classList.add("dark")
    else html.classList.remove("dark")
  }

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light"
      localStorage.setItem("admin_theme", next)
      applyTheme(next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
