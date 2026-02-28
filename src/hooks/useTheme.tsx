import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "Light" | "Dark" | "System";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "Dark",
  setTheme: () => {},
  resolvedTheme: "dark",
});

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("nexus-theme");
    return (stored as Theme) || "Dark";
  });

  const resolvedTheme: "light" | "dark" =
    theme === "System" ? getSystemTheme() : theme === "Light" ? "light" : "dark";

  useEffect(() => {
    localStorage.setItem("nexus-theme", theme);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [theme, resolvedTheme]);

  // Listen for system theme changes when "System" is selected
  useEffect(() => {
    if (theme !== "System") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      // Force a re-render to recalculate resolvedTheme
      setThemeState("System");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
