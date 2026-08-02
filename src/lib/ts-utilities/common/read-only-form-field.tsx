import {Form} from "antd";
import {useTranslate} from "@refinedev/core";
import {ReactNode} from "react";


type propsType = {
    label: string,
    content: string | number | undefined | ReactNode,
    isLoading?: boolean

}
export const ReadOnlyFormField = ({label, content, isLoading}: propsType) => {
    const translate = useTranslate();
    return(
    <Form.Item
        label={translate(label)}>
        <div
            style={{
                minHeight: 32,
                padding: "4px 11px",
                border: "1px solid #E8E9EE",
                borderRadius: 6,
                background: "#FFFFFF",
                color: "#12131A",
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
        >
            {isLoading ? "Chargement..." : (content ?? "—")}
        </div>
    </Form.Item>
    )
}