import { useState } from "react";

interface ConnectionPanelProps {
  onConnect: (apiKeyId: string, pem: string, env: "live" | "demo") => Promise<void>;
  onDisconnect: () => Promise<void>;
  connected: boolean;
  loading: boolean;
}

export function ConnectionPanel({ onConnect, onDisconnect, connected, loading }: ConnectionPanelProps) {
  const [env, setEnv] = useState<"live" | "demo">("demo");
  const [apiKeyId, setApiKeyId] = useState("");
  const [pem, setPem] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    try {
      await onConnect(apiKeyId, pem, env);
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleDisconnect() {
    setError(null);
    try {
      await onDisconnect();
    } catch (err) {
      setError(String(err));
    }
  }

  if (connected) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-state-success)", display: "inline-block" }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Connected</span>
        </div>
        <button className="btn btn-danger" disabled={loading} onClick={handleDisconnect} style={{ width: "100%" }}>
          {loading ? "Disconnecting…" : "Disconnect"}
        </button>
        {error && <div style={{ marginTop: 8, fontSize: 12, color: "var(--color-state-error)" }}>{error}</div>}
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="card-header" style={{ marginBottom: 12, padding: 0, background: "transparent", border: "none" }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Connect API Keys</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 6 }}>Environment</label>
        <div style={{ display: "flex", gap: 16 }}>
          {(["demo", "live"] as const).map((e) => (
            <label key={e} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
              <input type="radio" name="env" checked={env === e} onChange={() => setEnv(e)} />
              <span style={{ textTransform: "capitalize" }}>{e}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 4 }}>API Key ID</label>
        <input
          className="input"
          type="text"
          placeholder="Enter API Key ID"
          value={apiKeyId}
          onChange={(e) => setApiKeyId(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 4 }}>RSA Private Key (PEM)</label>
        <textarea
          className="input"
          placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;..."
          value={pem}
          onChange={(e) => setPem(e.target.value)}
          rows={5}
          style={{ width: "100%", resize: "vertical", fontFamily: "var(--font-family-mono)", fontSize: 11 }}
        />
      </div>

      {error && (
        <div style={{ marginBottom: 10, padding: 8, borderRadius: "var(--border-radius-sm)", background: "rgba(220,38,38,0.08)", color: "var(--color-state-error)", fontSize: 12 }}>
          {error}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: "100%" }}
        disabled={loading || !apiKeyId.trim() || !pem.trim()}
        onClick={handleConnect}
      >
        {loading ? "Connecting…" : "Connect"}
      </button>
    </div>
  );
}
