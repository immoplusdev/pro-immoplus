import React from "react";
import {Card, Form, Select, Space} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {statusDemandeVisite, typeDemandeVisiteList} from "@/core/domain/residences";

interface VisiteActionsFieldProps {
    translate: (key: string, params?: Record<string, any>) => string;
}

export const DemandeVisiteEditActionFields: React.FC<VisiteActionsFieldProps> = ({ translate }) => {
    return (
        <Card
            title={
                <Space>
                    <EditOutlined />
                    <p>{translate("demandes_visites.fields.actions")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem" }}
            bodyStyle={{ padding: "2rem" }}
        >
            <Form.Item
                label={translate("demandes_visites.fields.status_demande_visite")}
                name={["statusDemandeVisite"]}
                rules={[{ required: true }]}
            >
                <Select options={statusDemandeVisite.map(item => ({
                    value: item,
                    label: <span>{translate(`demandes_visites.fields.${item}`)}</span>
                }))}/>
            </Form.Item>
            <Form.Item
                label={translate("demandes_visites.fields.type_demande_visite")}
                name={["typeDemandeVisite"]}
                rules={[{ required: true }]}
            >
                <Select options={typeDemandeVisiteList.map(item => ({
                    value: item,
                    label: <span>{translate(`demandes_visites.fields.${item}`)}</span>
                }))}/>
            </Form.Item>
        </Card>
    );
};