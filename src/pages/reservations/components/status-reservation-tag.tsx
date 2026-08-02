import { useTranslate } from "@refinedev/core";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";
import { OutlineTag } from "@/components/table";

type Props = {
  status: string;
};

export function StatusReservationTag({ status }: Props) {
  const translate = useTranslate();
  const color = statusReservationToColor(status);

  return (
    <OutlineTag color={color}>
      {translate(`reservations.status_reservation.${status}`)}
    </OutlineTag>
  );
}

function statusReservationToColor(status: string) {
  switch (status) {
    case StatusReservation.Valide:
      return "#1F8A5B";
    case StatusReservation.EnCours:
      return "#185FA5";
    case StatusReservation.EnAttenteReponseProprietaire:
      return "#B86B0A";
    case StatusReservation.EnAttentePaiementClient:
      return "#185FA5";
    case StatusReservation.Rejete:
    case StatusReservation.ProprietaireAnnuleReservation:
    case StatusReservation.ProprietaireSansReponse:
    case StatusReservation.clientAnnuleReservation:
    case StatusReservation.ClientSansReponse:
      return "#C13838";
    case StatusReservation.Terminee:
    default:
      return "#5F5E5A";
  }
}
