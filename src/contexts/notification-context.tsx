import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useTranslate, useList, useIsAuthenticated } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";
import { getTempsRestant, isRelevantStatus, useReservationDelays } from "@/pages/reservations/components/reservation-countdown";
import {
  useAdminNotificationsSocket,
  WsNotificationType,
} from "@/hooks/useAdminNotificationsSocket";
import { authService } from "@/lib/services/auth/auth.service";

const formatMontant = (val: unknown): string | null => {
  const n = Number(val);
  if (!val || isNaN(n)) return null;
  return `${n.toLocaleString("fr-FR")} FCFA`;
};

const formatRemaining = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m > 0 && s > 0) return `${m} min ${s} s`;
  if (m > 0) return `${m} min`;
  return `${s} s`;
};

export interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'success';
  title: string;
  description: string;
  createdAt: number;
  read: boolean;
  reservationId?: string;
  isTimerWarning?: boolean;
  /** WebSocket event type — present only for real-time WS notifications */
  wsType?: WsNotificationType;
  /** Navigation link for the resource (set by WS events) */
  resourceLink?: string;
}

export interface Toast extends Notification {
  visible: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  activeToasts: Toast[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'> & { dismissAfterMs?: number }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: (id: string) => void;
  wsConnected: boolean;
  wsError: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MAX_HISTORY = 50;
const STORAGE_KEY = 'immoplus_notifications';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const translate = useTranslate();
  const queryClient = useQueryClient();

  const { data: authData } = useIsAuthenticated();
  const isAuthenticated = authData?.authenticated === true;
  const reservationDelays = useReservationDelays();

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed: Notification[] = JSON.parse(saved);
      const now = Date.now();
      return parsed
        .map(n => now - n.createdAt > 24 * 60 * 60 * 1000 ? { ...n, read: true } : n)
        .slice(0, MAX_HISTORY);
    } catch {
      return [];
    }
  });

  const [activeToasts, setActiveToasts] = useState<Toast[]>([]);
  const prevReservationsRef = useRef<Record<string, any>>({});
  const warnedTimers = useRef<Set<string>>(new Set());

  // Déduplication : évite de répéter la même notif après rechargement
  const notifiedKeys = useRef<Set<string>>(
    new Set(
      notifications
        .filter(n => n.reservationId && !n.isTimerWarning)
        .map(n => `${n.reservationId}:${n.type}:${n.title}`)
    )
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const dismissToast = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addNotification = useCallback((
    n: Omit<Notification, 'id' | 'createdAt' | 'read'> & { dismissAfterMs?: number }
  ) => {
    const { dismissAfterMs, ...notifFields } = n;

    if (notifFields.reservationId && !notifFields.isTimerWarning) {
      const key = `${notifFields.reservationId}:${notifFields.type}:${notifFields.title}`;
      if (notifiedKeys.current.has(key)) return;
      notifiedKeys.current.add(key);
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newNotif: Notification = { ...notifFields, id, createdAt: Date.now(), read: false };

    setNotifications(prev => [newNotif, ...prev].slice(0, MAX_HISTORY));
    setActiveToasts(prev => [...prev, { ...newNotif, visible: true }]);

    const timeout = dismissAfterMs ?? (notifFields.type !== 'urgent' ? 10_000 : undefined);
    if (timeout !== undefined) {
      setTimeout(() => dismissToast(id), timeout);
    }
  }, [dismissToast]);

  // ─────────────────────────────────────────────────────────────────────────
  // WebSocket — real-time admin notifications
  // ─────────────────────────────────────────────────────────────────────────
  const handleWsNotification = useCallback(
    (payload: import("@/hooks/useAdminNotificationsSocket").WsNotificationPayload) => {
      addNotification({
        type: "warning",
        title: payload.title,
        description: payload.description,
        wsType: payload.wsType,
        resourceLink: payload.resourceLink,
        dismissAfterMs: 5_000,
      });
    },
    [addNotification]
  );

  const { isConnected: wsConnected, connectionError: wsError, reconnectWithNewToken } =
    useAdminNotificationsSocket({
      onNotification: handleWsNotification,
      enabled: isAuthenticated,
    });

  // Retry WS connection after a successful token refresh
  const prevWsError = useRef(wsError);
  useEffect(() => {
    if (wsError && !prevWsError.current) {
      // Error just appeared — try refreshing the token then reconnecting
      authService.refreshToken().then((result) => {
        if (result?.access_token) {
          reconnectWithNewToken();
        }
      });
    }
    prevWsError.current = wsError;
  }, [wsError, reconnectWithNewToken]);

  const processReservations = useCallback((reservations: any[]) => {
    if (!reservations?.length) return;

    const prev = prevReservationsRef.current;
    const isFirstLoad = Object.keys(prev).length === 0;

    reservations.forEach((res: any) => {
      if (!res?.id) return;
      const prevRes = prev[res.id];
      const status: string = res.statusReservation;

      if (!prevRes && !isFirstLoad) {
        if (status === StatusReservation.EnAttenteReponseProprietaire) {
          const parts = [
            res.codeReservation,
            res.clientName ?? res.clientPhoneNumber,
            formatMontant(res.montantTotalReservation),
          ].filter(Boolean).join(" · ");
          addNotification({
            type: 'warning',
            title: translate("notifications.new_reservation_title", "Nouvelle réservation"),
            description: parts,
            reservationId: res.id,
          });
        } else if (status === StatusReservation.EnAttentePaiementClient) {
          const montant = formatMontant(res.montantTotalReservation);
          addNotification({
            type: 'warning',
            title: translate("notifications.pro_confirmed_title", "Propriétaire a confirmé"),
            description: [res.codeReservation, montant ? `Paiement de ${montant} attendu` : "En attente de paiement"].filter(Boolean).join(" · "),
            reservationId: res.id,
          });
        }
      } else if (prevRes && !isFirstLoad) {
        if (
          prevRes.statusReservation === StatusReservation.EnAttenteReponseProprietaire &&
          status === StatusReservation.EnAttentePaiementClient
        ) {
          const montant = formatMontant(res.montantTotalReservation);
          addNotification({
            type: 'success',
            title: translate("notifications.pro_confirmed_title", "Propriétaire a confirmé"),
            description: [res.codeReservation, montant ? `Paiement de ${montant} attendu` : "En attente de paiement"].filter(Boolean).join(" · "),
            reservationId: res.id,
          });
        }

        if (prevRes.statusFacture === 'non_paye' && res.statusFacture === 'paye') {
          const montant = formatMontant(res.montantTotalReservation);
          addNotification({
            type: 'success',
            title: translate("notifications.payment_received_title", "Paiement reçu"),
            description: [res.codeReservation, montant ? `${montant} encaissés` : null].filter(Boolean).join(" · "),
            reservationId: res.id,
          });
        }

        if (
          prevRes.statusReservation !== status &&
          (status === StatusReservation.ProprietaireSansReponse ||
            status === StatusReservation.ClientSansReponse)
        ) {
          const party = status === StatusReservation.ProprietaireSansReponse
            ? "Le propriétaire n'a pas répondu"
            : "Le client n'a pas répondu";
          addNotification({
            type: 'urgent',
            title: translate("notifications.expired_title", "Réservation expirée"),
            description: `${res.codeReservation} · ${party}`,
            reservationId: res.id,
          });
        }
      }

      if (isRelevantStatus(status) && !isFirstLoad) {
        const remaining = getTempsRestant(res, reservationDelays);
        if (remaining > 0 && remaining <= 3 * 60 * 1000 && !warnedTimers.current.has(res.id)) {
          addNotification({
            type: 'urgent',
            title: translate("notifications.urgent_timer_title", "Délai critique"),
            description: `${res.codeReservation} · Il reste ${formatRemaining(remaining)} pour confirmer`,
            reservationId: res.id,
            isTimerWarning: true,
          });
          warnedTimers.current.add(res.id);
        }
      }
    });

    reservations.forEach((r: any) => { if (r?.id) prev[r.id] = r; });
  }, [addNotification, translate, reservationDelays]);

  // ─────────────────────────────────────────────────────────────────────────
  // Polling background toutes les 20s — détecte les nouvelles réservations
  // ─────────────────────────────────────────────────────────────────────────
  useList({
    resource: "reservations",
    pagination: { pageSize: 50, current: 1 },
    sorters: [{ field: "createdAt", order: "desc" }],
    filters: [
      { field: "statusFacture", operator: "eq", value: "non_paye" },
      {
        field: "statusReservation",
        operator: "in",
        value: [
          StatusReservation.EnAttenteReponseProprietaire,
          StatusReservation.EnAttentePaiementClient,
        ],
      },
    ],
    queryOptions: {
      enabled: isAuthenticated,
      refetchInterval: isAuthenticated ? 20_000 : false,
      refetchIntervalInBackground: true,
    },
  });

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated') return;
      if (event.query.state.status !== 'success') return;
      if (event.query.state.fetchStatus !== 'idle') return;

      const key = event.query.queryKey as unknown[];

      const isReservationList =
        (key[0] === 'reservations' && key[1] === 'list') ||
        (Array.isArray(key[0]) && key[0][0] === 'reservations' && key[0][1] === 'list');

      if (!isReservationList) return;

      const data = event.query.state.data as any;
      const reservations: any[] = data?.data ?? [];
      processReservations(reservations);
    });

    return () => unsubscribe();
  }, [queryClient, processReservations]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        activeToasts,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        dismissToast,
        wsConnected,
        wsError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
