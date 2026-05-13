import {Card, Form, Input, Select, Space, theme} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {enumToList} from "@/lib/ts-utilities";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import React from "react";
import {BaseRecord} from "@refinedev/core";
import {StatusFacture} from "@/lib/ts-utilities/enums/status-facture";

type TranslateFunction = (key: string, params?: Record<string, any>) => string;
interface ReadOnlySectionProps {
    translate: TranslateFunction;
    residencesData?: BaseRecord;
}
export const ReservationEditActionFields: React.FC<ReadOnlySectionProps> = ({translate}) => {
    const { token } = theme.useToken();
    const borderStyle = `0.5px solid ${token.colorBorder}`;

    return (
        <Card
            title={
                <Space>
                    <EditOutlined/>
                    <p>{translate("reservations.fields.actions", )}</p>
                </Space>
            }
            headStyle={{ padding: "1rem", border: borderStyle }}
            bodyStyle={{ padding: "2rem", border: borderStyle }}
        >
            <Form.Item
                label={translate("reservations.fields.status_facture")}
                name={["statusFacture"]}
                rules={[{required: true}]}
            >
                <Select
                    style={{border: borderStyle, borderRadius:"7px"}}
                    options={enumToList(StatusFacture).map((item) =>({
                        value: item,
                        label:(<span>{translate(`reservations.fields.${item}`)}</span>)
                    }))}
                />
            </Form.Item>
            <Form.Item
                label={translate("reservations.fields.status_reservation")}
                name={["statusReservation"]}
                rules={[{required: true}]}
            >
                <Select
                    style={{border: borderStyle, borderRadius:"7px"}}
                    options={enumToList(StatusReservation).map((item) => ({
                        value: item,
                        label: (
                            <span>{translate(`reservations.status_reservation.${item}`)}</span>
                        ),
                    }))}
                />
            </Form.Item>
            <Form.Item
                label={translate("reservations.fields.rapport")}
                name={["rapport"]}
            >
                <Input.TextArea
                    rows={6}
                    style={{border: borderStyle, borderRadius:"7px"}}
                    placeholder={translate("reservations.fields.rapport_placeholder")}
                />
            </Form.Item>
        </Card>
    )
}