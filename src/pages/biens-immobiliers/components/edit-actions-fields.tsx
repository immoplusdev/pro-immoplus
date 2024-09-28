import React from "react";
import {Card, Form, Select, Space} from "antd";
import {enumToList} from "@/lib/ts-utilities";
import {bienImmobilierDisponible, StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import {EditOutlined} from "@ant-design/icons";

export const BienImmobilierEditActionFields: React.FC<{ translate: any }> = ({ translate }) => {

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
                label={translate("biens_immobiliers.fields.bien_immobilier_disponible")}
                style={{ width: 300 }}
                name={["bienImmobilierDisponible"]}
                rules={[{ required: true }]}
            >
                <Select
                    style={{border:"0.5px solid black", borderRadius:"7px"}}
                    options={enumToList(bienImmobilierDisponible).map(item => ({
                    value: item,
                    label: <span>{translate(`biens_immobiliers.fields.${item}`)}</span>
                }))}/>
            </Form.Item>
            <Form.Item
                label={translate("fields.status_validation")}
                style={{ width: 300 }}
                name={["statusValidation"]}
                rules={[{ required: true }]}
            >
                <Select
                    style={{border:"0.5px solid black", borderRadius:"7px"}}
                    options={enumToList(StatusReservation).map((item) => ({
                        value: item,
                        label: <span>{translate(`reservations.status_reservation.${item}`)}</span>,
                    }))}
                />
            </Form.Item>
        </Card>
    );
};