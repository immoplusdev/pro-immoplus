import React, { useEffect, useState, useRef } from "react";
import { Tag } from "antd";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";

interface Props {
  reservation: any;
  onExpire?: () => void;
}

const DELAI_MINUTES = 10;

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

export function getTempsRestant(reservation: any) {
  const delaiMs = DELAI_MINUTES * 60 * 1000;

  if (reservation.statusReservation === StatusReservation.EnAttenteReponseProprietaire) {
    return new Date(reservation.createdAt).getTime() + delaiMs - Date.now();
  }

  if (reservation.statusReservation === StatusReservation.EnAttentePaiementClient) {
    return new Date(reservation.updatedAt).getTime() + delaiMs - Date.now();
  }

  return 0;
}

export function isRelevantStatus(status: string) {
  return status === StatusReservation.EnAttenteReponseProprietaire || 
         status === StatusReservation.EnAttentePaiementClient;
}

export function ReservationCountdown({ reservation, onExpire }: Props) {
  const [tempsRestant, setTempsRestant] = useState<number>(getTempsRestant(reservation));
  const hasPlayedWarningSound = useRef(false);
  const hasPlayedExpireSound = useRef(false);
  const isRelevant = isRelevantStatus(reservation.statusReservation);

  useEffect(() => {
    if (!isRelevant) return;

    const initial = getTempsRestant(reservation);
    setTempsRestant(initial);

    if (initial <= 0) {
      hasPlayedExpireSound.current = true;
      return;
    }

    // Tick toutes les 15s pour détecter l'expiry et les changements de minute
    const interval = setInterval(() => {
      const remaining = getTempsRestant(reservation);
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
  }, [reservation, isRelevant, onExpire]);

  if (!isRelevant) return null;

  if (tempsRestant <= 0) {
    return <Tag color="error">Expiré</Tag>;
  }

  const minutes = Math.ceil(tempsRestant / 60000);
  const isUrgent = tempsRestant <= 3 * 60 * 1000;

  // Affichage minutes uniquement — moins stressant
  const displayTime = minutes <= 1 ? "< 1 min" : `${minutes} min`;

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
