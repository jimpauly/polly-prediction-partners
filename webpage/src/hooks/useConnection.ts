import { useState, useCallback } from "react";
import { connectionApi } from "../utils/apiClient";

export interface ConnectionState {
  connected: boolean;
  environment: "live" | "demo" | null;
  apiKeyIdMasked: string;
  loading: boolean;
  error: string | null;
}

export function useConnection() {
  const [state, setState] = useState<ConnectionState>({
    connected: false,
    environment: null,
    apiKeyIdMasked: "",
    loading: false,
    error: null,
  });

  const connect = useCallback(
    async (apiKeyId: string, privateKeyPem: string, environment: "live" | "demo") => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await connectionApi.connect({ api_key_id: apiKeyId, private_key_pem: privateKeyPem, environment });
        setState({
          connected: res.connected,
          environment: (res.environment as "live" | "demo") ?? environment,
          apiKeyIdMasked: res.api_key_id_masked,
          loading: false,
          error: null,
        });
      } catch (err) {
        setState((s) => ({ ...s, loading: false, error: String(err) }));
        throw err;
      }
    },
    []
  );

  const disconnect = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await connectionApi.disconnect();
      setState({
        connected: res.connected,
        environment: null,
        apiKeyIdMasked: res.api_key_id_masked,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: String(err) }));
      throw err;
    }
  }, []);

  return { ...state, connect, disconnect };
}
