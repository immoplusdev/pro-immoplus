import { useTranslate } from "@refinedev/core";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";
import { PillTag, PillTone } from "@/components/table";

type Props = {
  status: string;
};

export function StatusReservationTag({ status }: Props) {
  const translate = useTranslate();
  const tone = statusReservationToTone(status);

  return (
    <PillTag tone={tone}>
      {translate(`reservations.status_reservation.${status}`)}
    </PillTag>
  );
}

function statusReservationToTone(status: string): PillTone {
  switch (status) {
    case StatusReservation.Valide:
    case StatusReservation.Terminee:
      return "success";
    case StatusReservation.EnCours:
      return "info";
    case StatusReservation.EnAttenteReponseProprietaire:
      return "warning";
    case StatusReservation.EnAttentePaiementClient:
      return "accent";
    case StatusReservation.Rejete:
    case StatusReservation.ProprietaireAnnuleReservation:
    case StatusReservation.ProprietaireSansReponse:
    case StatusReservation.clientAnnuleReservation:
    case StatusReservation.ClientSansReponse:
      return "error";
    default:
      return "neutral";
  }
}
