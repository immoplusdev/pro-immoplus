import {useTranslate} from "@refinedev/core";
import {Link} from "react-router-dom";
import {Button} from "antd";
import {UserOutlined} from "@ant-design/icons";
import React from "react";

type Props = {
    id: string;
    title?: string;
    icon?: React.ReactNode;
}

export function ShowUserButton({id, title, icon}: Props) {
    const translate = useTranslate();

    return (
        <Link to={`/users/edit/${id}`}>
            <Button icon={icon || <UserOutlined/>}>
                {title || translate("users.common.see_user")}
            </Button>
        </Link>
    );
}
