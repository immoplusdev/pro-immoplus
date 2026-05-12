import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";

export const BannerTypeTag = ({ type }: { type: string }) => {
    const translate = useTranslate();
    const isPromo = type === "promo";
    return (
        <Tag color={isPromo ? "volcano" : "geekblue"}>
            {translate(isPromo ? "banners.type.promo" : "banners.type.notification") || type}
        </Tag>
    );
};
