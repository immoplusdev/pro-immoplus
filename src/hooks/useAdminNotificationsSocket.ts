import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/configs/app.config";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";

const storage = getLocalStorageProvider();

export type WsNotificationType =
  | "nouvelle_reservation"
  | "nouvelle_demande_visite"
  | "nouvelle_residence"
  | "nouveau_bien_immobilier"
  | "nouvelle_demande_pro";

export interface WsNotificationPayload {
  wsType: WsNotificationType;
  resourceLink: string;
  title: string;
  description: string;
  raw: Record<string, any>;
}

interface UseAdminNotificationsSocketOptions {
  onNotification: (payload: WsNotificationPayload) => void;
  enabled: boolean;
}

const WS_EVENTS: Record<string, WsNotificationType> = {
  "admin:nouvelle_reservation": "nouvelle_reservation",
  "admin:nouvelle_demande_visite": "nouvelle_demande_visite",
  "admin:nouvelle_residence": "nouvelle_residence",
  "admin:nouveau_bien_immobilier": "nouveau_bien_immobilier",
  "admin:nouvelle_demande_pro": "nouvelle_demande_pro",
};

function buildPayload(
  type: WsNotificationType,
  data: Record<string, any>
): WsNotificationPayload {
  switch (type) {
    case "nouvelle_reservation":
      return {
        wsType: type,
        resourceLink: `/reservations/edit/${data.reservationId}`,
        title: "Nouvelle réservation",
        description: [
          data.codeReservation ?? `Réf. #${data.reservationId}`,
          data.clientName ?? data.clientPhoneNumber ?? `Client #${data.clientId}`,
          data.montantTotalReservation
            ? `${Number(data.montantTotalReservation).toLocaleString("fr-FR")} FCFA`
            : null,
        ].filter(Boolean).join(" · "),
        raw: data,
      };
    case "nouvelle_demande_visite":
      return {
        wsType: type,
        resourceLink: `/demandes-visites/${data.demandeVisiteId}`,
        title: "Nouvelle demande de visite",
        description: [
          data.clientName ?? data.clientPhoneNumber ?? `Client #${data.clientId}`,
          data.nomBien ?? data.titreBien ?? (data.bienImmobilierId ? `Bien #${data.bienImmobilierId}` : null),
          data.typeBien ?? data.type ?? null,
        ].filter(Boolean).join(" · "),
        raw: data,
      };
    case "nouvelle_residence":
      return {
        wsType: type,
        resourceLink: `/residences/${data.residenceId}`,
        title: "Nouvelle résidence publiée",
        description: [
          data.nomResidence ?? data.nom ?? `Résidence #${data.residenceId}`,
          data.proprietaireName ?? data.nomProprietaire ?? `Propriétaire #${data.proprietaireId}`,
          data.ville ?? null,
        ].filter(Boolean).join(" · "),
        raw: data,
      };
    case "nouveau_bien_immobilier":
      return {
        wsType: type,
        resourceLink: `/biens-immobiliers/${data.bienImmobilierId}`,
        title: "Nouveau bien immobilier",
        description: [
          data.titreBien ?? data.titre ?? data.nom ?? `Bien #${data.bienImmobilierId}`,
          data.proprietaireName ?? data.nomProprietaire ?? `Propriétaire #${data.proprietaireId}`,
          data.ville ?? null,
        ].filter(Boolean).join(" · "),
        raw: data,
      };
    case "nouvelle_demande_pro":
      return {
        wsType: type,
        resourceLink: `/demandes-pro-particulier/${data.demandeId}`,
        title: "Nouvelle demande pro",
        description: [
          data.userName ?? data.nomComplet ?? data.nom ?? `Utilisateur #${data.userId}`,
          data.activite ?? null,
          data.telephone ?? data.email ?? null,
        ].filter(Boolean).join(" · "),
        raw: data,
      };
  }
}

export const useAdminNotificationsSocket = ({
  onNotification,
  enabled,
}: UseAdminNotificationsSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  // Stable ref so reconnect doesn't re-register listeners on every render
  const onNotificationRef = useRef(onNotification);
  useEffect(() => { onNotificationRef.current = onNotification; }, [onNotification]);

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

    const socket = io(`${API_URL}/admin-notifications`, {
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
        setConnectionError("notifications_unavailable");
      }
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setConnectionError("notifications_unavailable");
      console.error("[WS Admin] connection error:", err.message);
    });

    Object.entries(WS_EVENTS).forEach(([event, type]) => {
      socket.on(event, (data: Record<string, any>) => {
        const payload = buildPayload(type, data);
        onNotificationRef.current(payload);
      });
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
