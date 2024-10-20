import React from "react";
import {Card, Form, Select, Space} from "antd";
import {enumToList} from "@/lib/ts-utilities";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import {EditOutlined} from "@ant-design/icons";
import {yesNoOptions} from "@/core/domain/shared/form";

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
                style={{ width: "17vw" }}
                name={["bienImmobilierDisponible"]}
                rules={[{ required: true }]}
            >
                <Select
                    style={{border:"0.5px solid black", borderRadius:"7px"}}
                    options={yesNoOptions.map(option=>({
                        label: translate(option.label),
                        value: option.value || false
                    }))}
                />
            </Form.Item>
            <Form.Item
                label={translate("fields.status_validation")}
                style={{ width: "17vw" }}
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