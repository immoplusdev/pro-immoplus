import { useTranslate } from "@refinedev/core";
import { StatusDemandeProParticulier } from "@/core/domain/demandes-pro-particulier";
import { OutlineTag } from "@/components/table";

type Props = {
    status: StatusDemandeProParticulier | string;
};

export function StatusDemandeProParticulierTag({ status }: Props) {
    const translate = useTranslate();
    const { color, labelKey } = getStatusData(status);
    return <OutlineTag color={color}>{translate(labelKey)}</OutlineTag>;
}

function getStatusData(status: string) {
    switch (status) {
        case StatusDemandeProParticulier.Approved:
            return { color: "#1F8A5B", labelKey: "demandes_pro_particulier.status.approved" };
        case StatusDemandeProParticulier.Rejected:
            return { color: "#C13838", labelKey: "demandes_pro_particulier.status.rejected" };
        case StatusDemandeProParticulier.Pending:
        default:
            return { color: "#B86B0A", labelKey: "demandes_pro_particulier.status.pending" };
    }
}
