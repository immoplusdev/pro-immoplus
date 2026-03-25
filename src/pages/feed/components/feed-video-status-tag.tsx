import React from "react";
import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";

export enum FeedVideoStatus {
    Processing = "processing",
    Ready = "ready",
    Failed = "failed",
}

type Props = { status: string };

const statusColorMap: Record<string, string> = {
    [FeedVideoStatus.Ready]: "success",
    [FeedVideoStatus.Processing]: "processing",
    [FeedVideoStatus.Failed]: "error",
};

export function FeedVideoStatusTag({ status }: Props) {
    const translate = useTranslate();
    const color = statusColorMap[status] ?? "default";
    return <Tag color={color}>{translate(`feed.status.${status}`, status)}</Tag>;
}
