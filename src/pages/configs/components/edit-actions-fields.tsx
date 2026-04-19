import React from "react";
import {Card, Form, Input, Space} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {useTranslate} from "@refinedev/core";

export function ConfigEditActionFields() {
    const translate = useTranslate();
    return (
        <Card
            title={
                <Space>
                    <EditOutlined/>
                    <p>{translate("Actions")}</p>
                </Space>
            }
            headStyle={{padding: "1rem", border: "0.5px solid black"}}
            bodyStyle={{padding: "2rem", border: "0.5px solid black"}}
        >
            <Form.Item
                label={translate("configs.fields.normal_visit_price")}
                style={{width: 300,}}
                name={["normalVisitPrice"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label={translate("configs.fields.express_visit_price")}
                style={{width: 300}}
                name={["expressVisitPrice"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label={translate("configs.fields.contact_email")}
                style={{width: 300}}
                name={["contactEmail"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label={translate("configs.fields.contact_phone_number")}
                style={{width: 300}}
                name={["contactPhoneNumber"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label={translate("configs.fields.pro_validation_minutes")}
                style={{width: 300}}
                name={["proValidationMinutes"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input type="number"/>
            </Form.Item>
            <Form.Item
                label={translate("configs.fields.customer_payment_minutes")}
                style={{width: 300}}
                name={["customerPaymentMinutes"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input type="number"/>
            </Form.Item>
        </Card>
    );
};
