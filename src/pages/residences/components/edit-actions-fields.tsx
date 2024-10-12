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
                label={translate("residences.fields.residence_disponible")}
                style={{width: 300, }}
                name={["residenceDisponible"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select
                    style={{border:"0.5px solid black", borderRadius:"7px"}}
                    options={enumToList(ResidenceValide).map(item => ({
                    value: item,
                    label: <span>{translate(`residences.fields.${item}`)}</span>
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
                <Select style={{border:"0.5px solid black", borderRadius:"7px"}} options={enumToList(StatusReservation).map(item => ({
                    value: item,
                    label: <span>{translate(`reservations.status_reservation.${item}`)}</span>
                }))}/>
            </Form.Item>
        </Card>
    );
};