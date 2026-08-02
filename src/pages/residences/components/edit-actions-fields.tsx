import React from "react";
import {Card, Form, InputNumber, Select, Space} from "antd";
import {enumToList} from "@/lib/ts-utilities";
import {ResidenceValide, StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import {EditOutlined, UserOutlined} from "@ant-design/icons";
import {BaseRecord} from "@refinedev/core";
import {yesNoOptions} from "@/core/domain/shared/form";
import {ShowUserButton} from "@/pages/users/components";


type TranslateFunction = (key: string, params?: Record<string, any>) => string;
interface ReadOnlySectionProps {
    translate: TranslateFunction;
    residencesData?: BaseRecord;
    ownerId?: string;
}

export const ResidenceEditActionFields: React.FC<ReadOnlySectionProps> = ({ translate, ownerId }) => {

    return (
        <>
            <Card
                style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
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
                    style={{width: "17vw", }}
                    name={["residenceDisponible"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        style={{border: "1px solid #E8E9EE", borderRadius: 6}}
                        options={yesNoOptions.map(option => ({
                        value: option.value || false,
                        label: translate(option.label)
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
                    <Select style={{border: "1px solid #E8E9EE", borderRadius: 6}} options={enumToList(StatusReservation).map(item => ({
                        value: item,
                        label: <span>{translate(`reservations.status_reservation.${item}`)}</span>
                    }))}/>
                </Form.Item>
                <Form.Item
                    label={translate("Score")}
                    style={{width: 300}}
                    name={["score"]}
                >
                    <InputNumber
                        min={0}
                        style={{width: "100%", border: "1px solid #E8E9EE", borderRadius: 6}}
                    />
                </Form.Item>
            </Card>

            <Card
                style={{ marginTop: 16, border: "1px solid #E8E9EE", borderRadius: 10 }}
                title={
                    <Space>
                        <UserOutlined />
                        <p>{translate("Propriétaire")}</p>
                    </Space>
                }
                headStyle={{ padding: "1rem" }}
                bodyStyle={{ padding: "2rem" }}
            >
                {ownerId ? (
                    <ShowUserButton id={ownerId} title={translate("users.common.see_owner")} />
                ) : (
                    <p>{translate("Aucun propriétaire associé")}</p>
                )}
            </Card>
        </>
    );
};
