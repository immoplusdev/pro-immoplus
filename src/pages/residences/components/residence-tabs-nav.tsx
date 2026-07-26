import React from "react";
import { Button, Space } from "antd";
import { Link } from "react-router-dom";
import { useTranslate } from "@refinedev/core";

export type ResidenceTabKey = "all_e" | "en_validation" | "valide" | "reduction";

type Props = {
    activeMenu?: ResidenceTabKey;
};

export function ResidenceTabsNav({ activeMenu }: Props) {
    const translate = useTranslate();

    return (
        <Space wrap>
            <Link to="/residences">
                <Button type={activeMenu === "all_e" ? "primary" : "default"}>
                    {translate("tags.all_e")}
                </Button>
            </Link>
            <Link to="/residences/en-validation">
                <Button type={activeMenu === "en_validation" ? "primary" : "default"}>
                    {translate("tags.en_validation")}
                </Button>
            </Link>
            <Link to="/residences/validé">
                <Button type={activeMenu === "valide" ? "primary" : "default"}>
                    {translate("residences.status_validation.valide")}
                </Button>
            </Link>
            <Link to="/residences/reduction">
                <Button type={activeMenu === "reduction" ? "primary" : "default"}>
                    {translate("tags.reduction")}
                </Button>
            </Link>
        </Space>
    );
}
