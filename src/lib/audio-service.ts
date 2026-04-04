/**
 * Service pour gérer les notifications sonores via l'API Web Audio.
 */
export type NotificationSoundType = 'new_reservation' | 'urgent' | 'expired' | 'success';

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export const playNotificationSound = async (type: NotificationSoundType) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    switch (type) {
      case 'new_reservation': {
        // Double bip moyen : 2 oscillations 'sine' à 660Hz, 200ms on, 150ms off.
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(660, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain1.gain.setValueAtTime(0.3, now + 0.2);
        gain1.gain.linearRampToValueAtTime(0, now + 0.25);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        const startTime2 = now + 0.35; // 200ms + 150ms silence
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(660, startTime2);
        gain2.gain.setValueAtTime(0, startTime2);
        gain2.gain.linearRampToValueAtTime(0.3, startTime2 + 0.05);
        gain2.gain.setValueAtTime(0.3, startTime2 + 0.2);
        gain2.gain.linearRampToValueAtTime(0, startTime2 + 0.25);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.3);
        osc2.start(startTime2);
        osc2.stop(startTime2 + 0.3);
        break;
      }

      case 'urgent': {
        // Son d'urgence : pulsation plus rapide, type 'square' pour attirer l'attention
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'expired': {
        // Son d'expiration : tonalité descendante
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }

      case 'success': {
        // Son de succès : mélodie ascendante
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
    }
  } catch (e) {
    console.error("Erreur lors de la lecture du son de notification:", e);
  }
};
