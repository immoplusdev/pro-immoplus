import React from "react";
import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";

export enum FeedParentType {
    Furniture = "furniture",
    Residence = "residence",
    BienImmobilier = "bien_immobilier",
}

type Props = { entity: string };

const entityColorMap: Record<string, string> = {
    [FeedParentType.Residence]: "blue",
    [FeedParentType.BienImmobilier]: "purple",
    [FeedParentType.Furniture]: "orange",
};

export function FeedEntityTag({ entity }: Props) {
    const translate = useTranslate();
    const color = entityColorMap[entity] ?? "default";
    return <Tag color={color}>{translate(`feed.entities.${entity}`, entity)}</Tag>;
}
