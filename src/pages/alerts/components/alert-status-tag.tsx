import { useTranslate } from "@refinedev/core";
import { OutlineTag } from "@/components/table";

type Props = {
    status: string;
};

export function AlertStatusTag({ status }: Props) {
    const translate = useTranslate();
    const { color, labelKey } = getStatusData(status);
    return <OutlineTag color={color}>{translate(labelKey)}</OutlineTag>;
}

function getStatusData(status: string) {
    switch (status) {
        case "active":
            return { color: "#185FA5", labelKey: "alerts.status.active" };
        case "pending":
            return { color: "#B86B0A", labelKey: "alerts.status.pending" };
        case "has_proposals":
            return { color: "#534AB7", labelKey: "alerts.status.has_proposals" };
        case "closed":
            return { color: "#5F5E5A", labelKey: "alerts.status.closed" };
        default:
            return { color: "#5F5E5A", labelKey: "alerts.status.pending" };
    }
}
