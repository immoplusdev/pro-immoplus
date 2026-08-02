import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/configs/app.config";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";

const storage = getLocalStorageProvider();

export interface ReservationStatusUpdatedPayload {
  reservationId: string;
  newStatus: string;
  updatedAt: string;
}

interface UseReservationSocketOptions {
  onStatusUpdated: (payload: ReservationStatusUpdatedPayload) => void;
  enabled: boolean;
}

export const useReservationSocket = ({
  onStatusUpdated,
  enabled,
}: UseReservationSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  // Stable ref so reconnect doesn't re-register listeners on every render
  const onStatusUpdatedRef = useRef(onStatusUpdated);
  useEffect(() => { onStatusUpdatedRef.current = onStatusUpdated; }, [onStatusUpdated]);

  const getToken = useCallback(() => {
    const data = storage.getAuthData();
    return data?.access_token ?? null;
  }, []);

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return;

    // Tear down any stale socket before creating a new one
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const socket = io(`${API_URL}/reservations`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30_000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      // "io server disconnect" means the server kicked us (auth failure / wrong role)
      if (reason === "io server disconnect") {
        setConnectionError("reservations_socket_unavailable");
      }
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setConnectionError("reservations_socket_unavailable");
      console.error("[WS Reservations] connection error:", err.message);
    });

    socket.on("reservation:status_updated", (payload: ReservationStatusUpdatedPayload) => {
      onStatusUpdatedRef.current(payload);
    });
  }, [getToken]);

  // Connect on mount, clean up on unmount
  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [enabled, connect]);

  /**
   * Call this after a token refresh to reconnect with the new credentials.
   */
  const reconnectWithNewToken = useCallback(() => {
    setConnectionError(null);
    connect();
  }, [connect]);

  return { isConnected, connectionError, reconnectWithNewToken };
};
