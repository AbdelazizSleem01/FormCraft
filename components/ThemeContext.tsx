"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  isDark: true,
  mounted: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((nextTheme: Theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", nextTheme);
    root.style.colorScheme = nextTheme === "dark" ? "dark" : "light";
    if (document.body) {
      document.body.setAttribute("data-theme", nextTheme);
    }
  }, []);

  useEffect(() => {
    // Load theme from localStorage
    try {
      const savedTheme = localStorage.getItem("theme") as Theme | "formcraft" | "formcraftLight" | null;
      if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } else if (savedTheme === "formcraft") {
        setTheme("dark");
        applyTheme("dark");
        localStorage.setItem("theme", "dark");
      } else if (savedTheme === "formcraftLight") {
        setTheme("light");
        applyTheme("light");
        localStorage.setItem("theme", "light");
      } else {
        // Default to dark theme
        applyTheme("dark");
      }
    } catch (e) {
      // localStorage might not be available
      applyTheme("dark");
    }
    setMounted(true);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch (e) {
      // localStorage might not be available
    }
    applyTheme(newTheme);
  }, [theme, applyTheme]);

  // Update theme when it changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark", mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}
