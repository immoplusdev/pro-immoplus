import {Button, Form} from "antd";
import React from "react";
import {useTranslate} from "@refinedev/core";

export function SubmitFilterButton() {
    const translate = useTranslate();
    return (
        <Form.Item>
            <Button htmlType="submit" type="primary">
                {translate("common.filter")}
            </Button>
        </Form.Item>
    )
}
