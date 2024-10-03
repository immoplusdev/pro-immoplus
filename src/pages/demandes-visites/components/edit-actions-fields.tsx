import React from "react";
import {Card, DatePicker, Form, Select, Space} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {
    statusValidationDemandeVisite,
    typeDemandeVisiteList
} from "@/core/domain/demande-visite/status-validation-demande-visite";
import {enumToList} from "@/lib/ts-utilities";
import {StatusFacture} from "@/lib/ts-utilities/enums/status-facture";
import {BaseKey} from "@refinedev/core";
import {programmerVisite} from "@/pages/demandes-visites/components/programmer-visite-service";



interface VisiteActionsFieldProps {
    translate: (key: string, params?: Record<string, any>) => string;
    id: BaseKey  | undefined
}

export const DemandeVisiteEditActionFields: React.FC<VisiteActionsFieldProps> = ({ translate, id }) => {


    return (
        <Card
            title={
                <Space>
                    <EditOutlined />
                    <p>{translate("demandes_visites.fields.actions")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem", border:"0.5px solid black"}}
            bodyStyle={{ padding: "2rem", border:"0.5px solid black", display:"flex", flexDirection: "column" }}
        >
            <Form.Item
                label={translate("demandes_visites.fields.status_demande_visite")}
                name={["statusDemandeVisite"]}
                rules={[{ required: true }]}
            >
                <Select
                    style={{border:"0.5px solid black", borderRadius:"7px"}}
                    options={statusValidationDemandeVisite.map(item => ({
                    value: item,
                    label: <span>{translate(`demandes_visites.fields.${item}`)}</span>
                }))}/>
            </Form.Item>
            <Form.Item
                label={translate("demandes_visites.fields.type_demande_visite")}
                name={["typeDemandeVisite"]}
                rules={[{ required: true }]}
            >
                <Select
                    style={{border:"0.5px solid black", borderRadius:"7px"}}
                    options={typeDemandeVisiteList.map(item => ({
                    value: item,
                    label: <span>{translate(`demandes_visites.fields.${item}`)}</span>
                }))}/>
            </Form.Item>
            <Form.Item
                label={translate("demandes_visites.fields.status_facture")}
                name={["statusFacture"]}
                rules={[{ required: true }]}
            >
                <Select
                    style={{border:"0.5px solid black", borderRadius:"7px"}}
                    options={enumToList(StatusFacture).map(item => ({
                    value: item,
                    label: <span>{translate(`demandes_visites.fields.${item}`)}</span>
                }))}/>
            </Form.Item>
            <Space direction="vertical" size={12}>
                <span>{translate("demandes_visites.fields.programmer_une_visite")}</span>
                <DatePicker
                    className="border-b-2"
                    showTime
                    onChange={( value,dateString) => {programmerVisite(id, dateString) }}
                    onOk={() => console.log("date ok")}
                />
            </Space>
        </Card>
    );

};