import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { Card } from './components/Card';

const studios = ['design', 'trade', 'flight', 'convert'] as const;
type Studio = typeof studios[number];

type VisibilityState = {
  header: boolean;
  left: boolean;
  right: boolean;
  bottom: boolean;
};

// --- helper subcomponents --------------------------------------------------

interface ToggleSwitchProps {
  label: string;
  on: boolean;
  onChange: (b: boolean) => void;
}
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, on, onChange }) => (
  <button
    role="switch"
    aria-checked={on}
    className="toggle-switch"
    onClick={() => onChange(!on)}
  >
    {label}: {on ? 'ON' : 'OFF'}
  </button>
);


interface StudioTabsProps {
  current: Studio;
  setCurrent: (s: Studio) => void;
}
const StudioTabs: React.FC<StudioTabsProps> = ({ current, setCurrent }) => {
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const el = tabRefs.current[index];
    if (el) el.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = studios.findIndex((s) => s === current);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (currentIndex + 1) % studios.length;
      focusTab(next);
      setCurrent(studios[next]);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (currentIndex - 1 + studios.length) % studios.length;
      focusTab(prev);
      setCurrent(studios[prev]);
    }
    if (e.key === 'Home') {
      e.preventDefault();
      focusTab(0);
      setCurrent(studios[0]);
    }
    if (e.key === 'End') {
      e.preventDefault();
      focusTab(studios.length - 1);
      setCurrent(studios[studios.length - 1]);
    }
  };

  // static lock placeholder; could be driven by profit state later
  const isFlightLocked = true;

  const icons: Record<Studio, React.ReactNode> = {
    design: (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2l4 4-4 4-4-4 4-4zm0 12c-4.41 0-8 3.59-8 8h16c0-4.41-3.59-8-8-8z"
          fill="currentColor"
        />
      </svg>
    ),
    trade: (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 4h16v2H4V4zm0 6h16v2H4v-2zm0 6h10v2H4v-2z"
          fill="currentColor"
        />
      </svg>
    ),
    flight: (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M2 21l21-9L2 3v7l15 2-15 2v7z"
          fill="currentColor"
        />
      </svg>
    ),
    convert: (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 4h16v2H4V4zm0 6h10v2H4v-2zm0 6h16v2H4v-2z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  return (
    <>
      <span className="hud-label" aria-hidden="true">
        HUD
      </span>
      <div role="tablist" className="studio-tabs" onKeyDown={handleKey}>
        {studios.map((s, idx) => {
          const locked = s === 'flight' && isFlightLocked;
          return (
            <button
              key={s}
              ref={(el) => (tabRefs.current[idx] = el)}
              role="tab"
              aria-selected={current === s}
              tabIndex={current === s ? 0 : -1}
              className={`studio-tab ${current === s ? 'active' : ''}`}
              onClick={() => !locked && setCurrent(s)}
              aria-disabled={locked}
              title={locked ? 'Unlock after $2k profit' : s}
              style={locked ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
            >
              <span className="tab-icon" aria-hidden="true">
                {icons[s]}
              </span>
              <span className="tab-label">{s.toUpperCase()}</span>
              {locked && <span className="tab-lock">🔒</span>}
            </button>
          );
        })}
      </div>
    </>
  );
};

interface PanelTogglesProps {
  vis: VisibilityState;
  toggle: (k: keyof VisibilityState) => void;
  fullscreenOn: boolean;
  toggleFullscreen: () => void;
}
const PanelToggles: React.FC<PanelTogglesProps> = ({ vis, toggle, fullscreenOn, toggleFullscreen }) => (
  <div className="panel-toggle-group" role="group" aria-label="Toggle UI regions">
    <button
      className="panel-toggle header-toggle"
      type="button"
      onClick={() => toggle('header')}
      aria-label="Toggle Header"
      aria-pressed={vis.header}
      title="Toggle Header"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="0" y="0" width="16" height="4" fill="currentColor" opacity={vis.header ? 1 : 0.25} />
        <rect x="0" y="4" width="16" height="12" fill="currentColor" opacity={vis.header ? 0.25 : 0.1} />
      </svg>
    </button>

    <button
      className="panel-toggle left-toggle"
      type="button"
      onClick={() => toggle('left')}
      aria-label="Toggle left sidebar"
      aria-pressed={vis.left}
      title="Toggle left sidebar"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="0" y="0" width="5" height="16" fill="currentColor" opacity={vis.left ? 1 : 0.25} />
        <rect x="5" y="0" width="11" height="16" fill="currentColor" opacity={vis.left ? 0.25 : 0.1} />
      </svg>
    </button>

    <button
      className={`panel-toggle max-toggle${fullscreenOn ? ' active' : ''}`}
      type="button"
      onClick={toggleFullscreen}
      aria-label="Toggle max view"
      aria-pressed={fullscreenOn}
      title="Toggle max view"
    >
      MAX
    </button>

    <button
      className="panel-toggle right-toggle"
      type="button"
      onClick={() => toggle('right')}
      aria-label="Toggle right sidebar"
      aria-pressed={vis.right}
      title="Toggle right sidebar"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="0" y="0" width="11" height="16" fill="currentColor" opacity={vis.right ? 0.25 : 0.1} />
        <rect x="11" y="0" width="5" height="16" fill="currentColor" opacity={vis.right ? 1 : 0.25} />
      </svg>
    </button>

    <button
      className="panel-toggle bottom-toggle"
      type="button"
      onClick={() => toggle('bottom')}
      aria-label="Toggle bottom bar"
      aria-pressed={vis.bottom}
      title="Toggle bottom bar"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="0" y="0" width="16" height="8" fill="currentColor" opacity={vis.bottom ? 1 : 0.25} />
        <rect x="0" y="8" width="16" height="8" fill="currentColor" opacity={vis.bottom ? 0.25 : 0.1} />
      </svg>
    </button>
  </div>
);

const TelemetryStrip: React.FC = () => {
  const [now, setNow] = React.useState(() => new Date());
  const [ping, setPing] = React.useState(12);
  const [cpu, setCpu] = React.useState(42);
  const [mem, setMem] = React.useState(1.2);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
      // simulate small telemetry fluctuations
      setPing((p) => Math.max(1, Math.min(99, p + (Math.random() * 10 - 5))));
      setCpu((c) => Math.max(1, Math.min(99, c + (Math.random() * 4 - 2))));
      setMem((m) => Math.max(0.4, Math.min(8, m + (Math.random() * 0.1 - 0.05))));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="telemetry-strip" aria-label="Telemetry readout" role="status">
      <span>PING {Math.round(ping)}ms</span>
      <span>CPU {Math.round(cpu)}%</span>
      <span>MEM {mem.toFixed(1)}GB</span>
      <span>{now.toLocaleTimeString()}</span>
    </div>
  );
};

const Nixie: React.FC<{ value: number }> = ({ value }) => (
  <span className="nixie">{value.toFixed(0).padStart(2, '0')}</span>
);

const Dial: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const step = 1;
  const min = 2;
  const max = 10;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="dial"
      aria-label="Dimmer dial"
    />
  );
};

const ChannelControl: React.FC<{
  label: string;
  on: boolean;
  onToggle: () => void;
  dimmer: number;
  onDimmer: (v: number) => void;
}> = ({ label, on, onToggle, dimmer, onDimmer }) => (
  <div className="channel-control">
    <div className="channel-row">
      <button
        className={`flip-switch ${on ? 'on' : 'off'}`}
        onClick={onToggle}
        aria-pressed={on}
        aria-label={`${label} power`}
      >
        {label}
      </button>
      <div className="channel-badge" aria-hidden="true" />
    </div>
    <div className="channel-row">
      <Dial value={dimmer} onChange={onDimmer} />
      <Nixie value={dimmer} />
    </div>
  </div>
);

const IlluminationSwitchboard: React.FC = () => {
  const [dayMode, setDayMode] = useState(true);
  const [masterOn, setMasterOn] = useState(false);
  const [masterDimmer, setMasterDimmer] = useState(10);
  const [textPrimaryOn, setTextPrimaryOn] = useState(true);
  const [textPrimaryDimmer, setTextPrimaryDimmer] = useState(10);
  const [textSecondaryOn, setTextSecondaryOn] = useState(true);
  const [textSecondaryDimmer, setTextSecondaryDimmer] = useState(10);
  const [barsPrimaryOn, setBarsPrimaryOn] = useState(true);
  const [barsPrimaryDimmer, setBarsPrimaryDimmer] = useState(10);
  const [barsSecondaryOn, setBarsSecondaryOn] = useState(true);
  const [barsSecondaryDimmer, setBarsSecondaryDimmer] = useState(10);
  const [floodOn, setFloodOn] = useState(true);
  const [floodDimmer, setFloodDimmer] = useState(10);
  const [displayOn, setDisplayOn] = useState(true);
  const [displayDimmer, setDisplayDimmer] = useState(10);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('nvg', !dayMode);
  }, [dayMode]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('master', masterOn);
  }, [masterOn]);

  React.useEffect(() => {
    const root = document.documentElement;

    const baseModeIntensity = dayMode ? 0.6 : 1.0;
    const masterScale = masterOn ? 1 : 0;

    const normalize = (on: boolean, dimmer: number) =>
      on ? baseModeIntensity * masterScale * (dimmer / 10) : 0;

    const textPrimary = normalize(textPrimaryOn, textPrimaryDimmer);
    const textSecondary = normalize(textSecondaryOn, textSecondaryDimmer);
    const barsPrimary = normalize(barsPrimaryOn, barsPrimaryDimmer);
    const barsSecondary = normalize(barsSecondaryOn, barsSecondaryDimmer);
    const flood = normalize(floodOn, floodDimmer);
    const display = normalize(displayOn, displayDimmer);

    root.style.setProperty('--fx-master-scale', String(masterScale));
    root.style.setProperty('--fx-glow-text-primary', String(textPrimary));
    root.style.setProperty('--fx-glow-text-secondary', String(textSecondary));
    root.style.setProperty('--fx-glow-bars-primary', String(barsPrimary));
    root.style.setProperty('--fx-glow-bars-secondary', String(barsSecondary));
    root.style.setProperty('--fx-glow-flood', String(flood));
    root.style.setProperty('--fx-glow-display', String(display));

    root.classList.toggle('text-glow', textPrimary > 0 || textSecondary > 0);
    root.classList.toggle('bar-glow', barsPrimary > 0 || barsSecondary > 0);
    root.classList.toggle('flood', flood > 0);
    root.classList.toggle('display-glow', display > 0);
  }, [
    dayMode,
    masterOn,
    textPrimaryOn,
    textPrimaryDimmer,
    textSecondaryOn,
    textSecondaryDimmer,
    barsPrimaryOn,
    barsPrimaryDimmer,
    barsSecondaryOn,
    barsSecondaryDimmer,
    floodOn,
    floodDimmer,
    displayOn,
    displayDimmer,
  ]);

  return (
    <Card title="ILLUMINATION SWITCHBOARD">
      <div className="illumination-grid">
        <div className="illumination-group">
          <div className="illumination-group-title">DAY / NVG</div>
          <button
            className={`flip-switch ${dayMode ? 'on' : 'off'}`}
            onClick={() => setDayMode((v) => !v)}
            aria-pressed={dayMode}
            aria-label="Day/Night toggle"
          >
            {dayMode ? 'DAY' : 'NVG'}
          </button>
        </div>

        <div className="illumination-group">
          <div className="illumination-group-title">MASTER</div>
          <ChannelControl
            label="MASTER"
            on={masterOn}
            onToggle={() => setMasterOn((v) => !v)}
            dimmer={masterDimmer}
            onDimmer={setMasterDimmer}
          />
        </div>

        <div className="illumination-group">
          <div className="illumination-group-title">TEXT</div>
          <ChannelControl
            label="PRIMARY"
            on={textPrimaryOn}
            onToggle={() => setTextPrimaryOn((v) => !v)}
            dimmer={textPrimaryDimmer}
            onDimmer={setTextPrimaryDimmer}
          />
          <ChannelControl
            label="SECONDARY"
            on={textSecondaryOn}
            onToggle={() => setTextSecondaryOn((v) => !v)}
            dimmer={textSecondaryDimmer}
            onDimmer={setTextSecondaryDimmer}
          />
        </div>

        <div className="illumination-group">
          <div className="illumination-group-title">BARS</div>
          <ChannelControl
            label="PRIMARY"
            on={barsPrimaryOn}
            onToggle={() => setBarsPrimaryOn((v) => !v)}
            dimmer={barsPrimaryDimmer}
            onDimmer={setBarsPrimaryDimmer}
          />
          <ChannelControl
            label="SECONDARY"
            on={barsSecondaryOn}
            onToggle={() => setBarsSecondaryOn((v) => !v)}
            dimmer={barsSecondaryDimmer}
            onDimmer={setBarsSecondaryDimmer}
          />
        </div>

        <div className="illumination-group">
          <div className="illumination-group-title">FLOOD</div>
          <ChannelControl
            label="FLOOD"
            on={floodOn}
            onToggle={() => setFloodOn((v) => !v)}
            dimmer={floodDimmer}
            onDimmer={setFloodDimmer}
          />
        </div>

        <div className="illumination-group">
          <div className="illumination-group-title">DISPLAY</div>
          <ChannelControl
            label="DISPLAY"
            on={displayOn}
            onToggle={() => setDisplayOn((v) => !v)}
            dimmer={displayDimmer}
            onDimmer={setDisplayDimmer}
          />
        </div>
      </div>
    </Card>
  );
};

const HeaderRegion: React.FC<{ studio: Studio }> = ({ studio }) => {
  const title = React.useMemo(() => {
    switch (studio) {
      case 'design':
        return "Paulie's Studios";
      case 'trade':
        return "Paulie's Prediction Partners 🤖";
      case 'flight':
        return "Paulie's Flight Simulator";
      case 'convert':
        return "Paulie's File Converting Studio";
      default:
        return "Paulie's Studios";
    }
  }, [studio]);

  return (
    <header id="header-region" className="region" data-testid="header-region">
      <div className="brand">{title}</div>
      <IlluminationSwitchboard />
    </header>
  );
};

// theme management
const themes: Record<string, Record<string,string>> = {
  'webpage-light': {
    '--bg': '#ffffff',
    '--fg': '#000000',
    '--accent': '#0066cc',
  },
  'webpage-dark': {
    '--bg': '#111111',
    '--fg': '#f1f1f1',
    '--accent': '#49a1ff',
  },
  'mosaic-1993-light': {
    '--bg': '#008080',
    '--fg': '#000000',
    '--accent': '#cccccc',
  },
  'mosaic-1993-dark': {
    '--bg': '#004040',
    '--fg': '#ffffff',
    '--accent': '#888888',
  },
};

function applyTheme(name: string) {
  const root = document.documentElement;
  root.setAttribute('data-theme', name);
  const vars = themes[name] || {};
  for (const k in vars) {
    root.style.setProperty(k, vars[k]);
  }
}

interface LeftSidebarContentProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  elevationOn: boolean;
  setElevationOn: (v: boolean) => void;
  themeBase: 'webpage' | 'mosaic-1993';
  setThemeBase: (v: 'webpage' | 'mosaic-1993') => void;
  themeKey: string;
}

const LeftSidebarContent: React.FC<LeftSidebarContentProps> = ({
  darkMode,
  setDarkMode,
  elevationOn,
  setElevationOn,
  themeBase,
  setThemeBase,
  themeKey,
}) => {
  return (
    <>
      <div className="region-title">SYSTEM DESIGN</div>
      <Card title="MODES">
        <div className="mode-toggle-row">
          <ToggleSwitch
            label="Dark"
            on={darkMode}
            onChange={setDarkMode}
          />
          <ToggleSwitch
            label="Elevation"
            on={elevationOn}
            onChange={setElevationOn}
          />
        </div>
      </Card>
      <Card title="SYSTEM THEME">
        <div className="theme-grid">
          {[
            { key: 'webpage', label: 'Webpage' },
            { key: 'mosaic-1993', label: 'Mosaic' },
          ].map((t) => {
            const key = `${t.key}-${darkMode ? 'dark' : 'light'}`;
            const selected = key === themeKey;
            return (
              <button
                key={t.key}
                className={selected ? 'active' : ''}
                onClick={() => setThemeBase(t.key as 'webpage' | 'mosaic-1993')}
                aria-pressed={selected}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="theme-status">
          <span className="theme-status-label">Theme:</span>
          <span className="theme-status-value">{themeKey}</span>
        </div>
      </Card>
    </>
  );
};

const NoteTaker: React.FC = () => {
  const [text, setText] = useState('');
  return (
    <div>
      <textarea
        aria-label="Inspector notes"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type notes here..."
      />
    </div>
  );
};

const InspectorBooks: React.FC = () => {
  const books = ['Notes', 'Positions', 'History'] as const;
  type Book = typeof books[number];
  const [active, setActive] = useState<Book>('Notes');

  return (
    <div className="inspector">
      <div role="tablist" className="inspector-books">
        {books.map((b) => (
          <button
            key={b}
            role="tab"
            aria-selected={active === b}
            onClick={() => setActive(b)}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="inspector-panel">
        {active === 'Notes' && <NoteTaker />}
        {active === 'Positions' && <p>Positions list / P&amp;L chart</p>}
        {active === 'History' && <p>History log</p>}
      </div>
    </div>
  );
};

const RightSidebarContent: React.FC = () => (
  <>
    <div className="region-title">INSPECTOR PANEL</div>
    <Card title="INSPECTOR">
      <InspectorBooks />
    </Card>
    {/* send-card pinned to bottom, no header */}
    <Card className="no-header">
      <textarea placeholder="ideas and requests" aria-label="Feedback" />
      <button>Send to Paulie</button>
    </Card>
  </>
);

// small representation of active palette
const ActivePaletteCard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swatches = ['#42a5ff', '#ffca28', '#66bb6a', '#ab47bc', '#ff7043'];

  return (
    <Card title="Active Palette">
      <div className="palette-swatch-row">
        {swatches.map((color, i) => (
          <div
            key={color}
            className={`swatch${i === activeIndex ? ' active' : ''}`}
            style={{ background: color }}
            role="button"
            aria-pressed={i === activeIndex}
            aria-label={`Select palette ${i + 1}`}
            tabIndex={0}
            onClick={() => setActiveIndex(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveIndex(i);
            }}
          />
        ))}
      </div>
    </Card>
  );
};

// placeholder man-o'-meters card
const ManometersCard: React.FC = () => {
  const gauges = [
    { label: 'BATT', value: 7 },
    { label: 'NET', value: 4 },
    { label: 'MEM', value: 5 },
    { label: 'CPU', value: 3 },
  ];

  return (
    <Card title="Man-O'-Meters">
      <div className="manometer-grid">
        {gauges.map(({ label, value }) => (
          <div key={label} className="manometer" aria-label={`${label} meter`}>
            <div className="meter-face">{label}</div>
            <div className="meter-bar">
              {[...Array(10)].map((_, idx) => (
                <div
                  key={idx}
                  className={`meter-segment${idx < value ? ' active' : ''}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// System logs card component
const SystemLogsCard: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = () => {
    const now = new Date();
    const msg = `${now.toLocaleTimeString()} – system event`; 
    setLogs((l) => [msg, ...l].slice(0, 20));
  };
  const clearLogs = () => setLogs([]);

  return (
    <Card title="System Logs">
      <div className="logs-header">
        <button className="btn secondary" onClick={addLog} aria-label="Add log">
          +
        </button>
        <button className="btn secondary" onClick={clearLogs} aria-label="Clear logs">
          Clear
        </button>
      </div>
      <ul className="logs-list">
        {logs.length === 0 ? (
          <li className="log-empty">no logs</li>
        ) : (
          logs.map((l, i) => <li key={i}>{l}</li>)
        )}
      </ul>
    </Card>
  );
};

// Web elements showcase card
const WebElementsCard: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [showGrid, setShowGrid] = useState(true);
  const [dropdown, setDropdown] = useState('Option A');

  return (
    <Card title="Web Elements">
      <div className="elements-grid">
        <button className="btn primary">Primary</button>
        <button className="btn secondary">Secondary</button>
        <div className="field">
          <label className="field-label" htmlFor="sample-input">
            Text Input
          </label>
          <input id="sample-input" className="input" placeholder="text input" />
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Grid
        </label>
        <div className="field">
          <label className="field-label" htmlFor="sample-range">
            Range
          </label>
          <input
            id="sample-range"
            className="slider"
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
          />
          <span className="slider-value">{sliderValue}</span>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="sample-select">
            Select
          </label>
          <select
            id="sample-select"
            className="select"
            value={dropdown}
            onChange={(e) => setDropdown(e.target.value)}
          >
            <option>Option A</option>
            <option>Option B</option>
            <option>Option C</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

const PeriscopeViewingPort: React.FC<{
  studio: Studio;
  themeKey: string;
  elevationOn: boolean;
}> = ({ studio, themeKey, elevationOn }) => {
  const isDesign = studio === 'design';

  return (
    <div className="periscope">
      <div className="periscope-header">
        <div className="periscope-title">Periscope Viewing Port</div>
        <div className="periscope-subtitle">
          {themeKey} · {elevationOn ? 'Elevated' : 'Flat'}
        </div>
      </div>
      <div className="periscope-grid">
        <div className="periscope-card">
          <ActivePaletteCard />
        </div>
        <div className="periscope-card">
          <ManometersCard />
        </div>
        <div className="periscope-card periscope-wide">
          <SystemLogsCard />
        </div>
        <div className="periscope-card periscope-wide">
          <WebElementsCard />
        </div>
        <div className="periscope-canvas">
          <Card title="Viewport">
            <div className="periscope-canvas-placeholder">
              {isDesign ? 'Live preview / canvas placeholder' : 'Studio content goes here'}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface MainRegionContentProps {
  studio: Studio;
  themeKey: string;
  elevationOn: boolean;
}

const MainRegionContent: React.FC<MainRegionContentProps> = ({ studio, themeKey, elevationOn }) => (
  <>
    <div className="region-title">MAIN REGION - {studio.toUpperCase()}</div>
    <PeriscopeViewingPort
      studio={studio}
      themeKey={themeKey}
      elevationOn={elevationOn}
    />
  </>
);


// small toggles used within agent cards
const TriStateToggle: React.FC<{
  value: 'AUTO' | 'STANDBY' | 'OFF';
  onChange: (v: 'AUTO' | 'STANDBY' | 'OFF') => void;
}> = ({ value, onChange }) => {
  const options: Array<'AUTO' | 'STANDBY' | 'OFF'> = ['AUTO', 'STANDBY', 'OFF'];
  return (
    <div className="tri-toggle" role="radiogroup" aria-label="Agent mode">
      {options.map((opt) => (
        <button
          key={opt}
          role="radio"
          aria-checked={value === opt}
          className={value === opt ? 'active' : ''}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

const AgentCard: React.FC<{ name: string; icon: string }> = ({ name, icon }) => {
  const [mode, setMode] = useState<'AUTO' | 'STANDBY' | 'OFF'>('OFF');
  const indicatorColor = mode === 'AUTO' ? 'var(--accent)' : mode === 'STANDBY' ? 'rgba(255, 204, 0, 0.8)' : 'rgba(255, 80, 80, 0.75)';

  return (
    <div className="agent-card">
      <div className="agent-header">
        <span className="agent-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="agent-name">{name}</span>
        <span className="agent-led" style={{ background: indicatorColor }} aria-hidden="true" />
      </div>
      <TriStateToggle value={mode} onChange={setMode} />
    </div>
  );
};

const PLMFDCard: React.FC = () => {
  const [pl, setPl] = useState(123.45);
  const [equity, setEquity] = useState(10000);
  const [timeframe, setTimeframe] = useState('1m');
  const timeframes = ['1m', '5m', '15m', '1h', '1d'];

  return (
    <Card title="P/L MFD">
      <div className="pl-mfd">
        <div className="pl-header">
          <div className="pl-stats">
            <div className="pl-row">
              <span>Unrealized P/L</span>
              <span className={`pl-value ${pl >= 0 ? 'positive' : 'negative'}`}>
                ${pl.toFixed(2)}
              </span>
            </div>
            <div className="pl-row">
              <span>Equity</span>
              <span>${equity.toLocaleString()}</span>
            </div>
          </div>
          <div className="pl-controls">
            <button
              className="btn secondary"
              onClick={() => setPl((p) => p + (Math.random() - 0.5) * 50)}
            >
              Randomize
            </button>
          </div>
        </div>

        <div className="pl-chart" aria-label="P/L chart placeholder">
          <span className="pl-chart-placeholder">LINE CHART</span>
        </div>

        <div className="pl-axis-controls">
          <div className="pl-axis-label">Y:</div>
          <div className="pl-axis-buttons">
            {[10, 5, 0, -5, -10].map((v) => (
              <button key={v} className="btn secondary">
                {v}
              </button>
            ))}
          </div>
          <div className="pl-axis-label">X:</div>
          <div className="pl-axis-buttons">
            {timeframes.map((tf) => (
              <button
                key={tf}
                className={`btn secondary${tf === timeframe ? ' active' : ''}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const ConnectAPIKeysCard: React.FC = () => {
  const [mode, setMode] = useState<'Live' | 'Demo'>('Live');
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');
  const [connected, setConnected] = useState(false);

  const connect = () => {
    setConnected(true);
  };

  const forget = () => {
    setConnected(false);
    setKey('');
    setSecret('');
  };

  return (
    <Card title="Connect API Keys">
      <div className="api-keys">
        <div className="api-mode">
          <button
            className={`btn secondary${mode === 'Live' ? ' active' : ''}`}
            onClick={() => setMode('Live')}
          >
            Live
          </button>
          <button
            className={`btn secondary${mode === 'Demo' ? ' active' : ''}`}
            onClick={() => setMode('Demo')}
          >
            Demo
          </button>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="api-key">
            API Key
          </label>
          <input
            id="api-key"
            className="input"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="enter key"
            disabled={connected}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="api-secret">
            API Secret
          </label>
          <textarea
            id="api-secret"
            className="input"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="enter secret"
            rows={2}
            disabled={connected}
          />
        </div>

        <div className="api-actions">
          {!connected ? (
            <button className="btn primary" onClick={connect} disabled={!key || !secret}>
              Connect
            </button>
          ) : (
            <button className="btn secondary" onClick={forget}>
              Forget keys
            </button>
          )}
          {connected && <span className="status">Connected</span>}
        </div>
      </div>
    </Card>
  );
};

const IgnitionCard: React.FC = () => {
  const [ignited, setIgnited] = useState(false);
  return (
    <Card title="Ignition">
      <div className="ignition-panel">
        <div className="ignition-status">
          Status: <strong>{ignited ? 'ONLINE' : 'OFFLINE'}</strong>
        </div>
        <button
          className={`btn ${ignited ? 'secondary' : 'primary'}`}
          onClick={() => setIgnited((v) => !v)}
        >
          {ignited ? 'Shutdown' : 'Ignite'}
        </button>
      </div>
    </Card>
  );
};

// hangar bay specialized cards
const HangarBayContent: React.FC = () => (
  <>
    <div className="region-title">Hangar Bay</div>
    <div className="hangar-row">
      <Card title="Agent Access" className="hangar-card rectangle">
        <div className="card-strip" aria-hidden="true" />
        <div className="agent-grid">
          <AgentCard name="Peritia" icon="🤖" />
          <AgentCard name="Triton" icon="⚙️" />
          <AgentCard name="Orion" icon="🚀" />
          <AgentCard name="Helix" icon="🧠" />
        </div>
        <div className="card-nameplate">AGENT ACCESS</div>
      </Card>
      <div className="hangar-card square">
        <PLMFDCard />
      </div>
      <div className="hangar-card square">
        <ConnectAPIKeysCard />
      </div>
      <div className="hangar-card square">
        <IgnitionCard />
      </div>
    </div>
  </>
);

const BottomBarContent: React.FC = () => (
  <>
    <HangarBayContent />
    <Card title="Ignition" />
  </>
);

// throttle control for ignition panel
const ThrottleCard: React.FC = () => {
  const modes = ['AUTO','SEMI-AUTO','STOP'] as const;
  type Mode = typeof modes[number];
  const [mode, setMode] = useState<Mode>('STOP');
  const [locked, setLocked] = useState(false);

  const cycle = (dir: 1|-1) => {
    if (locked) return;
    const idx = modes.indexOf(mode);
    const next = modes[(idx + dir + modes.length) % modes.length];
    setMode(next);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') cycle(1);
    if (e.key === 'ArrowLeft') cycle(-1);
    if (e.key === ' ' || e.key === 'Enter') cycle(1);
  };

  return (
    <Card title="Global Throttle">
      <div
        role="radiogroup"
        tabIndex={0}
        onKeyDown={handleKey}
        className="throttle-telegraph"
        aria-label="Global throttle control"
      >
        {modes.map((m) => (
          <div
            key={m}
            role="radio"
            aria-checked={mode===m}
            className={"telegraph-panel" + (mode===m?" active":"")}
            onClick={() => !locked && setMode(m)}
          >
            {m}
          </div>
        ))}
      </div>
      <button
        className="lock-toggle"
        aria-pressed={locked}
        onClick={() => setLocked(!locked)}
      >
        {locked ? 'Unlock' : 'Lock'}
      </button>
    </Card>
  );
};

// ---------------------------------------------------------------------------

export function App() {
  const [currentStudio, setCurrentStudio] = useState<Studio>('design');
  const [vis, setVis] = useState<VisibilityState>({
    header: true,
    left: true,
    right: true,
    bottom: true,
  });
  const [fullscreenOn, setFullscreenOn] = useState(false);

  // Theme / UI state
  const [darkMode, setDarkMode] = useState(false);
  const [elevationOn, setElevationOn] = useState(true);
  const [themeBase, setThemeBase] = useState<'webpage' | 'mosaic-1993'>('webpage');

  const themeKey = `${themeBase}-${darkMode ? 'dark' : 'light'}`;

  React.useEffect(() => {
    applyTheme(themeKey);
  }, [themeKey]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('no-elevation', !elevationOn);
  }, [elevationOn]);

  const toggle = (key: keyof VisibilityState) => {
    setVis((v) => ({ ...v, [key]: !v[key] }));
  };

  const toggleFullscreen = () => {
    document.documentElement.classList.toggle('fullscreen');
    setFullscreenOn((v) => !v);
  };

  // container no longer uses automatic scaling; sizes are hand‑tuned
  return (
    <div id="app" className="quad-grid">
      {/* everything that belongs in quadrant II goes inside this container */}
      <div id="quadrant-ii" className="quadrant" data-testid="quadrant-ii">
        <div id="quadrant-ii-inner">
        {vis.header && <HeaderRegion studio={currentStudio} />}
        <nav id="nav-region" className="region" aria-label="Navigation">
          <StudioTabs current={currentStudio} setCurrent={setCurrentStudio} />
          <PanelToggles
            vis={vis}
            toggle={toggle}
            fullscreenOn={fullscreenOn}
            toggleFullscreen={toggleFullscreen}
          />
          <TelemetryStrip />
        </nav>
        {vis.left && (
          <aside id="left-sidebar" className="region" data-testid="left-sidebar">
            <LeftSidebarContent
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              elevationOn={elevationOn}
              setElevationOn={setElevationOn}
              themeBase={themeBase}
              setThemeBase={setThemeBase}
              themeKey={themeKey}
            />
          </aside>
        )}
        {vis.right && (
          <aside id="right-sidebar" className="region" data-testid="right-sidebar">
            <RightSidebarContent />
          </aside>
        )}
        <main id="main-region" className="region" data-testid="main-region">
          <div className="main-cards">
            <MainRegionContent studio={currentStudio} themeKey={themeKey} elevationOn={elevationOn} />
          </div>
        </main>
        <div id="footer-row" className="footer-row">
          {vis.bottom ? (
            <div id="bottom-bar" className="region" data-testid="bottom-bar">
              <BottomBarContent />
            </div>
          ) : (
            <div
              id="bottom-bar"
              className="region"
              data-testid="bottom-bar"
              aria-hidden="true"
            />
          )}
          <div id="action-bar" className="region" data-testid="action-bar">
            <ThrottleCard />
          </div>
        </div>
      </div> {/* end quadrant-ii-inner */}
      </div>      {/* preserve empty quadrants around II */}
      <div id="quadrant-i" className="quadrant" data-testid="quadrant-i">
        <div className="blank-quadrant">
          <p>
            leave blank because our webpage will be used in a browser in quad-split-screen,
          </p>
          <p>
            so everything's gotta be naturally developed one-quarter smaller than you would normally develop
          </p>
          <p>
            (if you normally develop something at 28px, instead give it only 7px). making-things-tiny-calculations do not have to be exactly .25 smaller, around .25 smaller everything.
          </p>
        </div>
      </div>
      <div id="quadrant-iii" className="quadrant" data-testid="quadrant-iii">
        <div className="blank-quadrant">
          <p>(Decoy Quadrant to make devs forget about counting pixels; Leave Blank)</p>
        </div>
      </div>
      <div id="quadrant-iv" className="quadrant" data-testid="quadrant-iv">
        <div className="blank-quadrant">
          <p>(Decoy Quadrant to ensure this website fits on all sizes; Leave Blank)</p>
        </div>
      </div>
    </div>
  );
}

// only boot in browser (but not during tests)
if (typeof document !== 'undefined' &&
    (typeof process === 'undefined' || process.env.NODE_ENV !== 'test')) {
  const rootElement = document.getElementById('app');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  } else {
    console.error('Root element not found');
  }
}

export default App;
