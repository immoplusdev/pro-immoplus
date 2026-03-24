import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";
import { StatusDemandeProParticulier } from "@/core/domain/demandes-pro-particulier";

type Props = {
    status: StatusDemandeProParticulier | string;
};

export function StatusDemandeProParticulierTag({ status }: Props) {
    const translate = useTranslate();
    const { color, labelKey } = getStatusData(status);
    return <Tag color={color}>{translate(labelKey)}</Tag>;
}

function getStatusData(status: string) {
    switch (status) {
        case StatusDemandeProParticulier.Approved:
            return { color: "success", labelKey: "demandes_pro_particulier.status.approved" };
        case StatusDemandeProParticulier.Rejected:
            return { color: "error", labelKey: "demandes_pro_particulier.status.rejected" };
        case StatusDemandeProParticulier.Pending:
        default:
            return { color: "warning", labelKey: "demandes_pro_particulier.status.pending" };
    }
}
