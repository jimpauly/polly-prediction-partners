import { useState, useCallback } from "react";
import { THEME_IDS } from "../constants";
export type { ThemeId, ModeId } from "../constants";
import type { ThemeId, ModeId } from "../constants";

function readStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(
    () => readStorage("ppp-theme", "webpage") as ThemeId
  );
  const [mode, setModeState] = useState<ModeId>(
    () => readStorage("ppp-mode", "light") as ModeId
  );

  const applyTheme = useCallback((t: ThemeId) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("ppp-theme", t); } catch { /* noop */ }
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: t } }));
    setThemeState(t);
  }, []);

  const applyMode = useCallback((m: ModeId) => {
    document.documentElement.dataset.mode = m;
    try { localStorage.setItem("ppp-mode", m); } catch { /* noop */ }
    document.dispatchEvent(new CustomEvent("modechange", { detail: { mode: m } }));
    setModeState(m);
  }, []);

  const toggleMode = useCallback(() => {
    applyMode(mode === "light" ? "dark" : "light");
  }, [mode, applyMode]);

  return { theme, mode, themes: THEME_IDS, setTheme: applyTheme, setMode: applyMode, toggleMode };
}
