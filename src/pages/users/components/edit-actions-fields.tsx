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
            headStyle={{ padding: "1rem", border:"0.5px solid black" }}
            bodyStyle={{ padding: "2rem", border:"0.5px solid black" }}
        >
            <Form.Item
                label={translate("users.fields.status")}
                name={["status"]}
                rules={[{ required: true }]}
            >
                <Select
                    style={{border:"0.5px solid black", borderRadius:"7px"}}
                    options={enumToList(StatusUser).map((item) =>({
                        value: item,
                        label:  <span>{translate(`users.fields.${item}`)}</span>
                    }))}
                />
            </Form.Item>
            <Form.Item
                label={translate("users.fields.compte_pro_valide")}
                name={["compteProValide"]}
                rules={[{ required: true }]}
            >
                <Select
                    style={{border:"0.5px solid black", borderRadius:"7px"}}
                    options={enumToList(StatusUser).map((item) =>({
                        value: item,
                        label:  <span>{translate(`users.fields.${item}`)}</span>
                    }))}
                />
            </Form.Item>
        </Card>
    );
};