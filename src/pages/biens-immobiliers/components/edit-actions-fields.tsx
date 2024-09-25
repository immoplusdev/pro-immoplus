import React from "react";
import {Card, Form, Select, Space} from "antd";
import {enumToList} from "@/lib/ts-utilities";
import {bienImmobilierDisponible, StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import {EditOutlined} from "@ant-design/icons";

export const BienImmobilierEditActionFields: React.FC<{ translate: any }> = ({ translate }) => {
    const renderSelectFormItem = (labelKey: string, name: string) => (
        <Form.Item
            label={translate(labelKey)}
            style={{ width: 300 }}
            name={name}
            rules={[{ required: true }]}
        >
            <Select
                options={enumToList(StatusReservation).map((item) => ({
                    value: item,
                    label: <span>{translate(`reservations.status_reservation.${item}`)}</span>,
                }))}
            />
        </Form.Item>
    );

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
                label={translate("biens_immobiliers.fields.bien_immobilier_disponible")}
                style={{ width: 300 }}
                name={["bienImmobilierDisponible"]}
                rules={[{ required: true }]}
            >
                <Select options={enumToList(bienImmobilierDisponible).map(item => ({
                    value: item,
                    label: <span>{translate(`biens_immobiliers.fields.${item}`)}</span>
                }))}/>
                {/*<Checkbox>Bien Immobilier Disponible</Checkbox>*/}
            </Form.Item>
            {renderSelectFormItem("fields.status_validation", "statusValidation")}
        </Card>
    );
};