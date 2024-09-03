import {Button, Form} from "antd";
import {BaseRecord, useTranslate} from "@refinedev/core";


type propsType = {
    label: string,
    content: string | number | undefined,
    isLoading: boolean

}
export const FormItemWithButton = ({label, content, isLoading}: propsType) => {
    const translate = useTranslate();
    return(
    <Form.Item
        label={translate(label)}>
        <Button style={{width: 300, display: "flex", justifyContent: "flex-start"}}>
            {isLoading ? <>Loading...</> : content}
        </Button>

    </Form.Item>
    )
}