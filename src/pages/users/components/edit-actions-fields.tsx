import React from "react";
import {Card, Form, Select, Space} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {enumToList} from "@/lib/ts-utilities";
import {StatusUser} from "@/lib/ts-utilities/enums/status-reservation";


export const UsersEditActionFields: React.FC<{ translate: any }> = ({ translate }) => {
    return (
        <Card
            title={
                <Space>
                    <EditOutlined />
                    <p>{translate("Actions")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem" }}
            bodyStyle={{ padding: "2rem" }}
        >
            <Form.Item
                label={translate("users.fields.status")}
                name={["status"]}
                rules={[{ required: true }]}
            >
                <Select
                    options={enumToList(StatusUser).map((item) =>({
                        value: item,
                        label:  <span>{translate(`users.status_reservation.${item}`)}</span>
                    }))}
                />
            </Form.Item>
            <Form.Item
                label={translate("users.fields.compte_pro_valide")}
                name={["compteProValide"]}
                rules={[{ required: true }]}
            >
                <Select
                    options={enumToList(StatusUser).map((item) =>({
                        value: item,
                        label:  <span>{translate(`user.status_reservation.${item}`)}</span>
                    }))}
                />
            </Form.Item>
        </Card>
    );
};