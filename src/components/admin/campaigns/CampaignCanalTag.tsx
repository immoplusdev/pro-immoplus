import { Tag } from "antd";
import { WhatsAppOutlined, BellOutlined } from "@ant-design/icons";
import { CampaignCanal, canalColor, canalLabel } from "@/types/campaigns.types";

export function CampaignCanalTag({ canal }: { canal: CampaignCanal }) {
  return (
    <Tag
      color={canalColor[canal]}
      icon={canal === CampaignCanal.Whatsapp ? <WhatsAppOutlined /> : <BellOutlined />}
    >
      {canalLabel[canal]}
    </Tag>
  );
}
