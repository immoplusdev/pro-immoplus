import {DatePicker, Form} from "antd";
import React from "react";
import {useTranslate} from "@refinedev/core";

const {RangePicker} = DatePicker;

export function DateCreatedFilterInput() {
    const translate = useTranslate();
    return (
        <Form.Item label={translate("fields.created_at")} name="createdAt">
            <RangePicker/>
        </Form.Item>
    )
}
