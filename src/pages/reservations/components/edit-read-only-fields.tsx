import {Card, Col, Form, Input, Row, Space} from "antd";
import {DatabaseOutlined} from "@ant-design/icons";
import React from "react";
import {BaseRecord} from "@refinedev/core";


type TranslateFunction = (key: string, params?: Record<string, any>) => string;
interface ReadOnlySectionProps {
    translate: TranslateFunction;
    residencesData?: BaseRecord;
}

export const ReservationEditDataFields: React.FC<ReadOnlySectionProps> = ({translate, residencesData}) => {
    return (
        <Card
            title={
                <Space>
                    <DatabaseOutlined/>
                    <p>{translate("reservations.fields.data")}</p>
                </Space>
            }
            headStyle={
                {
                    padding: "1rem"
                }
            }
            bodyStyle={
                {
                    padding: "2rem"
                }
            }
        >
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Form.Item
                        label={translate("fields.notes")}
                        name={["notes"]}
                        rules={[{required: true}]}
                    >
                        <Input readOnly/>
                    </Form.Item>
                    <Form.Item
                        label={translate("reservations.fields.retrait_pro_effectue")}
                        name={["retraitProEffectue"]}
                        valuePropName="checked"
                        rules={[{required: true}]}
                        getValueProps={(value) => ({
                            value: value ? "Oui" : "Non",
                        })}
                    >
                        <Input readOnly/>
                    </Form.Item>
                    <Form.Item
                        label={translate("reservations.fields.montant_total_reservation")}
                        name={["montantTotalReservation"]}
                        rules={[{required: true}]}
                    >
                        <Input readOnly/>
                    </Form.Item>

                    <Form.Item
                        label={translate("reservations.fields.montant_reservation_sans_commission")}
                        name={["montantReservationSansCommission"]}
                        rules={[{required: true}]}
                    >
                        <Input readOnly/>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        label={translate("fields.client_phone_number")}
                        name={["clientPhoneNumber"]}
                        rules={[{required: true}]}
                    >
                        <Input readOnly/>
                    </Form.Item>
                    <Form.Item
                        label={translate("fields.created_at")}
                        name={["createdAt"]}
                        rules={[{required: true}]}
                        getValueProps={(value) => ({
                            value: value ? (new Date(value).toLocaleDateString()) : undefined,
                        })}
                    >
                        <Input readOnly/>
                    </Form.Item>

                    <Form.Item
                        label={translate("fields.updated_at")}
                        name={["updatedAt"]}
                        rules={[{required: true}]}
                        getValueProps={(value) => ({
                            value: value ? (new Date(value).toLocaleDateString()) : undefined,
                        })}
                    >
                        <Input readOnly/>
                    </Form.Item>
                </Col>
            </Row>
        </Card>
    )
}