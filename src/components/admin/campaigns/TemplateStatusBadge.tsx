import { Link } from "react-router-dom";
import { Space, Tag, Tooltip, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { CampaignCanal, TemplateApprovalStatus } from "@/types/campaigns.types";
import type { CampaignTemplate } from "@/types/campaigns.types";
import { isTemplateEditable, templateEditPath } from "./campaign-helpers";

interface Props {
  template: Pick<CampaignTemplate, "templateId" | "statutApprobation" | "provider">;
  canal: CampaignCanal | undefined;
  /** affiche aussi « Approuvé » (liste des modèles) */
  showApproved?: boolean;
  /** lien « Modifier » vers l'édition quand le modèle est à réécrire */
  showEditLink?: boolean;
}

export function TemplateStatusBadge({ template, canal, showApproved, showEditLink }: Props) {
  const statut = template.statutApprobation;
  if (!statut) return null;

  if (statut === TemplateApprovalStatus.Approved) {
    return showApproved ? <Tag color="green">Approuvé</Tag> : null;
  }

  if (statut === TemplateApprovalStatus.Pending) {
    return <Tag color="gold">En attente d'approbation</Tag>;
  }

  if (canal !== CampaignCanal.Push) return <Tag color="red">Rejeté</Tag>;

  return (
    <Space size={4}>
      <Tooltip title="Modèle converti depuis OneSignal sans titre ou avec une syntaxe non supportée : il doit être réécrit (titre et texte) avant tout envoi.">
        <Tag color="volcano">À réécrire</Tag>
      </Tooltip>
      {showEditLink && isTemplateEditable(template) && (
        <Link to={templateEditPath(template.templateId)} onClick={(e) => e.stopPropagation()}>
          <Typography.Text style={{ fontSize: 12, color: "inherit" }}>
            <EditOutlined /> Modifier
          </Typography.Text>
        </Link>
      )}
    </Space>
  );
}
