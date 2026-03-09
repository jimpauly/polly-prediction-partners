import { useEffect, useRef } from "react";
import type { WsEventEnvelope } from "../types/trading";
import { connectEventStream } from "../utils/apiClient";
import { RECONNECT_DELAY_MS } from "../constants";

interface UseWebSocketOptions {
  enabled: boolean;
  onMessage: (event: WsEventEnvelope) => void;
}

export function useWebSocket({ enabled, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(enabled);
  const onMessageRef = useRef(onMessage);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!enabled) {
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }

    function open() {
      if (wsRef.current) { wsRef.current.close(); }
      wsRef.current = connectEventStream(
        (ev) => onMessageRef.current(ev),
        () => scheduleReconnect()
      );
      wsRef.current.onclose = () => {
        if (enabledRef.current) scheduleReconnect();
      };
    }

    function scheduleReconnect() {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(() => {
        if (enabledRef.current) open();
      }, RECONNECT_DELAY_MS);
    }

    open();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled]);
}
