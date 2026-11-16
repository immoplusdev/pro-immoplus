import { useNavigate } from "react-router-dom";
import { Alert, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { extractErrorMessage } from "@/lib/helpers";
import { isTemplateRelatedMessage, templateEditPath } from "./campaign-helpers";

interface Props {
  error: unknown;
  /** modèle de la campagne, pour le lien direct vers son édition */
  templateId?: string;
  onClose?: () => void;
}

/**
 * Refus d'envoi (409) : le message de l'API est affiché tel quel, avec un raccourci
 * « Modifier le modèle » quand il porte sur le modèle push.
 */
export function CampaignSendErrorAlert({ error, templateId, onClose }: Props) {
  const navigate = useNavigate();
  const message = extractErrorMessage(error, "L'envoi a été refusé.");
  const aboutTemplate = isTemplateRelatedMessage(message);

  return (
    <Alert
      type="error"
      showIcon
      closable={!!onClose}
      onClose={onClose}
      style={{ marginBottom: 16 }}
      message="Envoi refusé"
      description={message}
      action={
        aboutTemplate ? (
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(templateEditPath(templateId))}>
            Modifier le modèle
          </Button>
        ) : undefined
      }
    />
  );
}
