import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button } from "antd";
import { useInvalidateOnReminderSent } from "@/hooks/useReservationReminders";
import { parseReminderEvent, reminderFailureNotice } from "@/lib/helpers/reservation-reminders.helper";

/**
 * Réception de `admin:relance_reservation` : rafraîchit les vues de relances affichées et,
 * si un canal a échoué, affiche une notification avec un lien vers la réservation.
 * Aucun retour pour les envois réussis (trop fréquents).
 */
export function useReminderSentHandler() {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const invalidate = useInvalidateOnReminderSent();

  return useCallback(
    (raw: unknown) => {
      const event = parseReminderEvent(raw);
      if (!event) return;

      invalidate(event);

      const notice = reminderFailureNotice(event);
      if (!notice) return;

      const key = `relance-${event.reminderId || event.reservationId}`;
      notification.warning({
        key,
        message: notice.title,
        description: notice.description,
        duration: 10,
        actions: (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              notification.destroy(key);
              navigate(`/reservations/edit/${encodeURIComponent(event.reservationId)}`);
            }}
          >
            Ouvrir la réservation
          </Button>
        ),
      });
    },
    [invalidate, navigate, notification]
  );
}
