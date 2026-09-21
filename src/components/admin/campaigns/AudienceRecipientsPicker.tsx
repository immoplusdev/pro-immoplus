import { useState } from "react";
import { Button, Space, Tag, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RecipientPickerModal, RecipientPick } from "./RecipientPickerModal";
import type { CampaignCible } from "@/types/campaigns.types";

const { Text } = Typography;

interface Props {
  cible: CampaignCible;
  value: RecipientPick[];
  onChange: (value: RecipientPick[]) => void;
}

/**
 * Sélection manuelle de destinataires (audience.recipientIds, cf.
 * docs/drafts/campaigns.md §3) — recherche par nom/email, jusqu'à 5000 IDs.
 */
export function AudienceRecipientsPicker({ cible, value, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const remove = (id: string) => onChange(value.filter((r) => r.id !== id));

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={8}>
      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {value.map((r) => (
            <Tag key={r.id} closable onClose={() => remove(r.id)}>
              {r.lastName} {r.firstName}
            </Tag>
          ))}
        </div>
      )}

      <Button type="dashed" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
        Ajouter des destinataires
      </Button>

      <Text type="secondary" style={{ fontSize: 12 }}>
        {value.length > 0
          ? `${value.length} destinataire(s) sélectionné(s) (max 5000).`
          : "Recherchez et sélectionnez au moins un destinataire."}
      </Text>

      <RecipientPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cible={cible}
        initialSelected={value}
        onConfirm={onChange}
      />
    </Space>
  );
}
