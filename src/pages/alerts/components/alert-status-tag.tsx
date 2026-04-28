import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";

type Props = {
    status: string;
};

export function AlertStatusTag({ status }: Props) {
    const translate = useTranslate();
    const { color, labelKey } = getStatusData(status);
    return <Tag color={color}>{translate(labelKey)}</Tag>;
}

function getStatusData(status: string) {
    switch (status) {
        case "active":
            return { color: "blue", labelKey: "alerts.status.active" };
        case "pending":
            return { color: "warning", labelKey: "alerts.status.pending" };
        case "has_proposals":
            return { color: "purple", labelKey: "alerts.status.has_proposals" };
        case "closed":
            return { color: "default", labelKey: "alerts.status.closed" };
        default:
            return { color: "default", labelKey: "alerts.status.pending" };
    }
}
