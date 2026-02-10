import React from "react";
import {Card, Descriptions, Form, Select, Space, Spin} from "antd";
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
    ownerData?: BaseRecord;
    ownerLoading?: boolean;
}

export const ResidenceEditActionFields: React.FC<ReadOnlySectionProps> = ({ translate, ownerData, ownerLoading }) => {

    return (
        <>
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
                    style={{width: "17vw", }}
                    name={["residenceDisponible"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        style={{border:"0.5px solid black", borderRadius:"7px"}}
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
                    <Select style={{border:"0.5px solid black", borderRadius:"7px"}} options={enumToList(StatusReservation).map(item => ({
                        value: item,
                        label: <span>{translate(`reservations.status_reservation.${item}`)}</span>
                    }))}/>
                </Form.Item>
            </Card>

            <Card
                style={{ marginTop: 16 }}
                title={
                    <Space>
                        <UserOutlined />
                        <p>{translate("Propriétaire")}</p>
                    </Space>
                }
                headStyle={{ padding: "1rem", border:"0.5px solid black" }}
                bodyStyle={{ padding: "2rem", border:"0.5px solid black" }}
            >
                {ownerLoading ? (
                    <Spin />
                ) : ownerData ? (
                    <>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label={translate("fields.nom")}>
                                {ownerData.firstName} {ownerData.lastName}
                            </Descriptions.Item>
                            <Descriptions.Item label={translate("fields.email")}>
                                {ownerData.email}
                            </Descriptions.Item>
                            <Descriptions.Item label={translate("fields.phone_number")}>
                                {ownerData.phoneNumber}
                            </Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 16 }}>
                            <ShowUserButton id={String(ownerData.id)} title={translate("users.common.see_owner")} />
                        </div>
                    </>
                ) : (
                    <p>{translate("Aucun propriétaire associé")}</p>
                )}
            </Card>
        </>
    );
};
