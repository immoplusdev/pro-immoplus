import React, { useEffect, useState, useRef } from "react";
import { Tag } from "antd";
import { useCustom } from "@refinedev/core";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";
import { API_URL } from "@/configs";

interface Props {
  reservation: any;
  onExpire?: () => void;
}

export interface ReservationDelays {
  proValidationMinutes: number;
  customerPaymentMinutes: number;
}

const DEFAULT_DELAYS: ReservationDelays = {
  proValidationMinutes: 10,
  customerPaymentMinutes: 10,
};

// Config chargée une seule fois (mise en cache par react-query) et partagée
// par tous les composants qui affichent un compte à rebours de réservation.
export function useReservationDelays(): ReservationDelays {
  const { data } = useCustom({
    method: "get",
    url: `${API_URL}/configs`,
    queryOptions: { staleTime: 5 * 60 * 1000 },
  });

  const config = data?.data;

  return {
    proValidationMinutes: Number(config?.proValidationMinutes) || DEFAULT_DELAYS.proValidationMinutes,
    customerPaymentMinutes: Number(config?.customerPaymentMinutes) || DEFAULT_DELAYS.customerPaymentMinutes,
  };
}

function playUrgentSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime + 0.1); // A4
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    // Ignorer si l'audio n'est pas supporté ou interaction manquante
  }
}

function playExpiredSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) { }
}

export function getTempsRestant(reservation: any, delays: ReservationDelays = DEFAULT_DELAYS) {
  if (reservation.statusReservation === StatusReservation.EnAttenteReponseProprietaire) {
    const delaiMs = delays.proValidationMinutes * 60 * 1000;
    return new Date(reservation.createdAt).getTime() + delaiMs - Date.now();
  }

  if (reservation.statusReservation === StatusReservation.EnAttentePaiementClient) {
    const delaiMs = delays.customerPaymentMinutes * 60 * 1000;
    return new Date(reservation.updatedAt).getTime() + delaiMs - Date.now();
  }

  return 0;
}

export function isRelevantStatus(status: string) {
  return status === StatusReservation.EnAttenteReponseProprietaire ||
         status === StatusReservation.EnAttentePaiementClient;
}

// Formate un temps restant (ms) en "X min" sous 1h, ou "Xh Ymin" au-delà.
export function formatTempsRestant(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000);

  if (totalMinutes <= 1) return "< 1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}

export function ReservationCountdown({ reservation, onExpire }: Props) {
  const delays = useReservationDelays();
  const [tempsRestant, setTempsRestant] = useState<number>(getTempsRestant(reservation, delays));
  const hasPlayedWarningSound = useRef(false);
  const hasPlayedExpireSound = useRef(false);
  const isRelevant = isRelevantStatus(reservation.statusReservation);

  useEffect(() => {
    if (!isRelevant) return;

    const initial = getTempsRestant(reservation, delays);
    setTempsRestant(initial);

    if (initial <= 0) {
      hasPlayedExpireSound.current = true;
      return;
    }

    // Tick toutes les 15s pour détecter l'expiry et les changements de minute
    const interval = setInterval(() => {
      const remaining = getTempsRestant(reservation, delays);
      setTempsRestant(remaining);

      if (remaining <= 3 * 60 * 1000 && remaining > 0) {
        if (!hasPlayedWarningSound.current) {
          playUrgentSound();
          hasPlayedWarningSound.current = true;
        }
      }

      if (remaining <= 0) {
        clearInterval(interval);
        if (!hasPlayedExpireSound.current) {
          playExpiredSound();
          hasPlayedExpireSound.current = true;
        }
        if (onExpire) onExpire();
      }
    }, 15000); // 15s — assez précis sans afficher les secondes

    return () => clearInterval(interval);
  }, [reservation, isRelevant, onExpire, delays.proValidationMinutes, delays.customerPaymentMinutes]);

  if (!isRelevant) return null;

  if (tempsRestant <= 0) {
    return <Tag color="error">Expiré</Tag>;
  }

  const isUrgent = tempsRestant <= 3 * 60 * 1000;
  const displayTime = formatTempsRestant(tempsRestant);

  return (
    <>
      <style>{`
        @keyframes pulse-countdown {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
      <Tag
        color={isUrgent ? "error" : "processing"}
        style={isUrgent ? { animation: "pulse-countdown 2s ease-in-out infinite", fontWeight: "bold" } : {}}
      >
        ⏱ {displayTime}
      </Tag>
    </>
  );
}
