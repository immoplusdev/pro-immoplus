import {Button, Form} from "antd";
import {BaseRecord, useTranslate} from "@refinedev/core";


type propsType = {
    label: string,
    content: string | number | undefined,
    isLoading: boolean

}
export const ReadOnlyFormField = ({label, content, isLoading}: propsType) => {
    const translate = useTranslate();
    return(
    <Form.Item
        label={translate(label)}>
        <Button style={{width: 300, display: "flex", justifyContent: "flex-start", textOverflow: "ellipsis", overflow:"hidden"}}>
            {isLoading ? <>Loading...</> : content}
        </Button>
    </Form.Item>
    )
}