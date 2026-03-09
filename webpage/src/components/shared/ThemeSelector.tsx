import { THEME_IDS } from "../../constants";

interface ThemeSelectorProps {
  currentTheme: string;
  onSelect: (themeId: string) => void;
}

export function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Theme
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {THEME_IDS.map((t) => (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className={`btn btn-sm ${currentTheme === t ? "btn-primary" : "btn-ghost"}`}
            style={{
              fontSize: 10,
              padding: "4px 6px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: "left",
            }}
            title={t}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
