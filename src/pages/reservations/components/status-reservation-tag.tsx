import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";

type Props = {
  status: string;
};

export function StatusReservationTag({ status }: Props) {
  const translate = useTranslate();
  const color = statusReservationToColor(status);

  return (
    <Tag color={color}>
      {translate(`reservations.status_reservation.${status}`)}
    </Tag>
  );
}

function statusReservationToColor(status: string) {
  switch (status) {
    case StatusReservation.Valide:
      return "success";
    case StatusReservation.EnCours:
      return "processing";
    case StatusReservation.EnAttenteReponseProprietaire:
      return "warning";
    case StatusReservation.EnAttentePaiementClient:
      return "processing";
    case StatusReservation.Rejete:
    case StatusReservation.ProprietaireAnnuleReservation:
    case StatusReservation.ProprietaireSansReponse:
    case StatusReservation.clientAnnuleReservation:
    case StatusReservation.ClientSansReponse:
      return "error";
    case StatusReservation.Terminee:
    default:
      return "default";
  }
}
