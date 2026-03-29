import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";

export enum FeedVideoStatus {
    Processing = "processing",
    Ready = "ready",
    Failed = "failed",
    Deleted = "deleted",
}

type Props = { status: string };

const statusColorMap: Record<string, string> = {
    [FeedVideoStatus.Ready]: "success",
    [FeedVideoStatus.Processing]: "processing",
    [FeedVideoStatus.Failed]: "error",
    [FeedVideoStatus.Deleted]: "default",
};

export function FeedVideoStatusTag({ status }: Props) {
    const translate = useTranslate();
    const color = statusColorMap[status] ?? "default";
    const statusLabel = translate(`feed.status.${status}`);
    return <Tag color={color}>{statusLabel}</Tag>;
}
