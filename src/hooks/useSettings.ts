import { useState, useEffect } from "react";

export type ThemeOption = "Light" | "Dark" | "System";

export interface Settings {
  slippage: string;
  gasPriority: string;
  twoFactor: boolean;
  timeout: string;
  theme: ThemeOption;
  desktopNotifs: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  slippage: "0.5%",
  gasPriority: "Fast",
  twoFactor: false,
  timeout: "1h",
  theme: "Dark",
  desktopNotifs: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem("settings");
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // apply theme changes to document root
  useEffect(() => {
    const apply = (prefersDark: boolean) => {
      document.documentElement.classList.toggle("dark", prefersDark);
    };

    if (settings.theme === "System") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    } else {
      apply(settings.theme === "Dark");
    }
  }, [settings.theme]);

  const save = () => {
    try {
      localStorage.setItem("settings", JSON.stringify(settings));
    } catch {}
  };

  const restore = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return { settings, setSettings, save, restore };
}
