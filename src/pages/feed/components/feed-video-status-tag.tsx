import { useTranslate } from "@refinedev/core";
import { OutlineTag } from "@/components/table";

export enum FeedVideoStatus {
    Processing = "processing",
    Ready = "ready",
    Failed = "failed",
    Deleted = "deleted",
}

type Props = { status: string };

const statusColorMap: Record<string, string> = {
    [FeedVideoStatus.Ready]: "#1F8A5B",
    [FeedVideoStatus.Processing]: "#185FA5",
    [FeedVideoStatus.Failed]: "#C13838",
    [FeedVideoStatus.Deleted]: "#5F5E5A",
};

export function FeedVideoStatusTag({ status }: Props) {
    const translate = useTranslate();
    const color = statusColorMap[status] ?? "#5F5E5A";
    const statusLabel = translate(`feed.status.${status}`);
    return <OutlineTag color={color}>{statusLabel}</OutlineTag>;
}
