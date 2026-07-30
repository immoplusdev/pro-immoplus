import type { ReactNode } from "react";
import { Tag } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { CertificationStatus } from "@/types/pro-certification.types";

interface Props {
  status: CertificationStatus;
  size?: "default" | "large";
}

const STATUS_CONFIG: Record<
  CertificationStatus,
  { color: string; label: string; icon?: ReactNode }
> = {
  [CertificationStatus.EN_PROGRESSION]: { color: "default", label: "En progression" },
  [CertificationStatus.ELIGIBLE]: { color: "blue", label: "Éligible" },
  [CertificationStatus.CERTIFIE]: {
    color: "green",
    label: "Certifié ✦",
    icon: <StarOutlined />,
  },
  [CertificationStatus.SUSPENDU]: { color: "orange", label: "Suspendu" },
  [CertificationStatus.RETIRE]: { color: "red", label: "Retiré" },
};

export function CertificationStatusTag({ status, size = "default" }: Props) {
  const config = STATUS_CONFIG[status] ?? { color: "default", label: status };
  return (
    <Tag
      color={config.color}
      icon={config.icon}
      style={size === "large" ? { fontSize: 14, padding: "4px 12px" } : undefined}
    >
      {config.label}
    </Tag>
  );
}
