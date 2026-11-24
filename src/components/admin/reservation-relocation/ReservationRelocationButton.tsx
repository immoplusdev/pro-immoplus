import { useState } from "react";
import { Button } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { canShowRelocationButton } from "@/lib/helpers/reservation-relocation.helper";
import { relocationQueryKeys } from "@/hooks/useReservationRelocation";
import { RelocationModal } from "./RelocationModal";

interface Props {
  reservation?: {
    id?: string | number;
    statusReservation?: string | null;
    dateDebut?: string | null;
    residenceId?: string | null;
    residence?: { id?: string | null; nom?: string | null } | null;
  } | null;
  isAdmin: boolean;
  /** Recharge le détail de la réservation. */
  onReload: () => void;
}

/** Bouton « Changer de résidence » de la fiche réservation (Admin, statuts relogeables, séjour à venir). */
export function ReservationRelocationButton({ reservation, isAdmin, onReload }: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  // 403 du back (rôle modifié côté serveur) : la fonctionnalité disparaît pour la session.
  const [forbidden, setForbidden] = useState(false);

  if (forbidden || !reservation?.id || !canShowRelocationButton(reservation, { isAdmin })) return null;

  const reservationId = String(reservation.id);
  const reloadAll = () => {
    onReload();
    queryClient.invalidateQueries(relocationQueryKeys.history(reservationId));
  };

  return (
    <>
      <Button icon={<SwapOutlined />} onClick={() => setOpen(true)}>
        Changer de résidence
      </Button>
      {open && (
        <RelocationModal
          open={open}
          reservationId={reservationId}
          currentResidenceId={reservation.residence?.id ?? reservation.residenceId ?? null}
          currentResidenceName={reservation.residence?.nom ?? null}
          onClose={() => setOpen(false)}
          onRelocated={reloadAll}
          onReloadReservation={reloadAll}
          onForbidden={() => setForbidden(true)}
        />
      )}
    </>
  );
}
