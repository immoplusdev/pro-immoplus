import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useTranslate, useList, useIsAuthenticated } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";
import { getTempsRestant, isRelevantStatus } from "@/pages/reservations/components/reservation-countdown";

export interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'success';
  title: string;
  description: string;
  createdAt: number;
  read: boolean;
  reservationId?: string;
  isTimerWarning?: boolean;
}

export interface Toast extends Notification {
  visible: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  activeToasts: Toast[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MAX_HISTORY = 50;
const STORAGE_KEY = 'immoplus_notifications';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const translate = useTranslate();
  const queryClient = useQueryClient();

  const { data: authData } = useIsAuthenticated();
  const isAuthenticated = authData?.authenticated === true;

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

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    if (n.reservationId && !n.isTimerWarning) {
      const key = `${n.reservationId}:${n.type}:${n.title}`;
      if (notifiedKeys.current.has(key)) return;
      notifiedKeys.current.add(key);
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newNotif: Notification = { ...n, id, createdAt: Date.now(), read: false };

    setNotifications(prev => [newNotif, ...prev].slice(0, MAX_HISTORY));
    setActiveToasts(prev => [...prev, { ...newNotif, visible: true }]);

    // Toasts urgents restent jusqu'à fermeture manuelle, les autres disparaissent après 10s
    if (n.type !== 'urgent') {
      setTimeout(() => dismissToast(id), 10_000);
    }
  }, [dismissToast]);

  const processReservations = useCallback((reservations: any[]) => {
    if (!reservations?.length) return;

    const prev = prevReservationsRef.current;
    const isFirstLoad = Object.keys(prev).length === 0;

    reservations.forEach((res: any) => {
      if (!res?.id) return;
      const prevRes = prev[res.id];
      const status: string = res.statusReservation;

      if (!prevRes && !isFirstLoad) {
        // Réservation genuinement nouvelle (détectée après le premier snapshot)
        if (status === StatusReservation.EnAttenteReponseProprietaire) {
          addNotification({
            type: 'warning',
            title: translate("notifications.new_reservation_title", "Nouvelle Réservation"),
            description: `${res.codeReservation} — ${res.clientPhoneNumber} — ${res.montantTotalReservation} CFA`,
            reservationId: res.id,
          });
        } else if (status === StatusReservation.EnAttentePaiementClient) {
          addNotification({
            type: 'warning',
            title: translate("notifications.pro_confirmed_title", "Propriétaire a confirmé"),
            description: `La réservation ${res.codeReservation} est en attente de paiement.`,
            reservationId: res.id,
          });
        }
      } else if (prevRes && !isFirstLoad) {
        // Changements de statut détectés sur les refreshes suivants
        if (
          prevRes.statusReservation === StatusReservation.EnAttenteReponseProprietaire &&
          status === StatusReservation.EnAttentePaiementClient
        ) {
          addNotification({
            type: 'success',
            title: translate("notifications.pro_confirmed_title", "Propriétaire a confirmé"),
            description: `La réservation ${res.codeReservation} est en attente de paiement.`,
            reservationId: res.id,
          });
        }

        if (prevRes.statusFacture === 'non_paye' && res.statusFacture === 'paye') {
          addNotification({
            type: 'success',
            title: translate("notifications.payment_received_title", "Paiement Reçu"),
            description: `Le paiement pour ${res.codeReservation} a été effectué.`,
            reservationId: res.id,
          });
        }

        if (
          prevRes.statusReservation !== status &&
          (status === StatusReservation.ProprietaireSansReponse ||
            status === StatusReservation.ClientSansReponse)
        ) {
          addNotification({
            type: 'urgent',
            title: translate("notifications.expired_title", "Réservation Expirée"),
            description: `Le délai pour ${res.codeReservation} est écoulé.`,
            reservationId: res.id,
          });
        }
      }

      // Alerte timer < 3 min
      if (isRelevantStatus(status) && !isFirstLoad) {
        const remaining = getTempsRestant(res);
        if (remaining > 0 && remaining <= 3 * 60 * 1000 && !warnedTimers.current.has(res.id)) {
          addNotification({
            type: 'urgent',
            title: translate("notifications.urgent_timer_title", "Urgence Chrono"),
            description: `Moins de 3 minutes pour ${res.codeReservation} !`,
            reservationId: res.id,
            isTimerWarning: true,
          });
          warnedTimers.current.add(res.id);
        }
      }
    });

    // Mise à jour du snapshot
    reservations.forEach((r: any) => { if (r?.id) prev[r.id] = r; });
  }, [addNotification, translate]);

  // ─────────────────────────────────────────────────────────────────────────
  // Polling background toutes les 20s — détecte les nouvelles réservations
  // même quand l'utilisateur n'est pas sur la page /reservations/en-validation.
  // Désactivé si non authentifié (évite la boucle infinie sur la page login).
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

  // ─────────────────────────────────────────────────────────────────────────
  // Abonnement au cache React Query — réactif à chaque fetch de la table
  // ─────────────────────────────────────────────────────────────────────────
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
      value={{ notifications, activeToasts, unreadCount, addNotification, markAsRead, markAllAsRead, dismissToast }}
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
