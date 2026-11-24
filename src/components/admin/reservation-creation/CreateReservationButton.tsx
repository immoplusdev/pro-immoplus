import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { isAdminViewer } from "@/components/auth/is-admin-viewer";
import { createReservationUrl } from "@/lib/helpers/admin-reservation-creation.helper";

/** Bouton « Créer une réservation » : rôle Admin uniquement (Financier et Commercial ne le voient pas). */
export function CreateReservationButton({ clientId, type = "default" }: { clientId?: string | null; type?: "default" | "primary" }) {
  if (!isAdminViewer()) return null;
  return (
    <Link to={createReservationUrl(clientId)}>
      <Button type={type} icon={<PlusOutlined />}>
        Créer une réservation
      </Button>
    </Link>
  );
}
