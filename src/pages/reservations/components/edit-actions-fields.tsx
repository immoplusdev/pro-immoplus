import {Card, Form, Input, Select, Space} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {enumToList} from "@/lib/ts-utilities";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import React from "react";
import {BaseRecord} from "@refinedev/core";

type TranslateFunction = (key: string, params?: Record<string, any>) => string;
interface ReadOnlySectionProps {
    translate: TranslateFunction;
    residencesData?: BaseRecord;
}
export const ReservationEditActionFields: React.FC<ReadOnlySectionProps> = ({translate}) => {
    return (
        <Card
            title={
                <Space>
                    <EditOutlined/>
                    <p>{translate("reservations.fields.actions", )}</p>
                </Space>
            }
            headStyle={{padding: "1rem"}}
            bodyStyle={{padding: "2rem"}}
        >
            <Form.Item
                label={translate("reservations.fields.status_facture")}
                name={["statusFacture"]}
                rules={[{required: true}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item
                label={translate("reservations.fields.status_reservation")}
                name={["statusReservation"]}
                rules={[{required: true}]}
            >
                <Select
                    options={enumToList(StatusReservation).map((item) => ({
                        value: item,
                        label: (
                            <span>{translate(`reservations.status_reservation.${item}`)}</span>
                        ),
                    }))}
                />
            </Form.Item>
        </Card>
    )
}