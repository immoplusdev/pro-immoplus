import React from "react";
import {Card, Form, Select, Space} from "antd";
import {enumToList} from "@/lib/ts-utilities";
import {ResidenceValide, StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import {EditOutlined} from "@ant-design/icons";
import {BaseRecord} from "@refinedev/core";


type TranslateFunction = (key: string, params?: Record<string, any>) => string;
interface ReadOnlySectionProps {
    translate: TranslateFunction;
    residencesData?: BaseRecord;
}

export const ResidenceEditActionFields: React.FC<ReadOnlySectionProps> = ({ translate }) => {
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
                label={translate("residences.fields.residence_disponible")}
                style={{width: 300}}
                name={["residenceDisponible"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select options={enumToList(ResidenceValide).map(item => ({
                    value: item,
                    label: <span>{translate(`reservations.fields.${item}`)}</span>
                }))}/>
            </Form.Item>
            <Form.Item
                label={translate("fields.status_validation")}
                style={{width: 300}}
                name={["statusValidation"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select options={enumToList(StatusReservation).map(item => ({
                    value: item,
                    label: <span>{translate(`reservations.status_reservation.${item}`)}</span>
                }))}/>
            </Form.Item>
        </Card>
    );
};