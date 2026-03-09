import { useState, useEffect, useRef } from "react";
import { stateApi } from "../utils/apiClient";
import { PING_INTERVAL_MS } from "../constants";

function formatDateTime(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mn}:${ss}`;
}

export function useTelemetry() {
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [dateTimeStr, setDateTimeStr] = useState(() => formatDateTime(new Date()));
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function ping() {
      const start = Date.now();
      try {
        await stateApi.exchangeStatus();
        if (mountedRef.current) {
          setPingMs(Date.now() - start);
          setBackendHealthy(true);
        }
      } catch {
        if (mountedRef.current) {
          setPingMs(null);
          setBackendHealthy(false);
        }
      }
    }

    ping();
    const pingInterval = setInterval(ping, PING_INTERVAL_MS);

    const clockInterval = setInterval(() => {
      if (mountedRef.current) setDateTimeStr(formatDateTime(new Date()));
    }, 1000);

    return () => {
      mountedRef.current = false;
      clearInterval(pingInterval);
      clearInterval(clockInterval);
    };
  }, []);

  return { pingMs, backendHealthy, dateTimeStr };
}
