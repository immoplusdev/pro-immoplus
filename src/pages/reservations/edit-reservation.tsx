import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, Checkbox, Card, Row, Col, Space } from "antd";
import { useTranslate } from "@refinedev/core";
import dayjs from "dayjs";
import {enumToList, ReadOnlyFormField} from "@/lib/ts-utilities";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";
import { DatabaseOutlined, EditOutlined } from "@ant-design/icons";
import {ImageCarousel} from "@/components/images/image-carousel";
import {getCarouselUrls} from "@/lib/helpers";

export const EditReservation: React.FC = () => {
    const translate = useTranslate();
    const { formProps, saveButtonProps, queryResult } = useForm();
    const reservationData = queryResult?.data?.data;
    const { selectProps: residenceSelectProps } = useSelect({
        resource: "residences",
        filters: undefined,
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <div className="w-50 mb-4">
                    <ImageCarousel
                        images={getCarouselUrls(reservationData?.residence.miniatureId, reservationData?.residence.images)}
                    />
            </div>
            {/*{console.log(reservationData?.residence.miniatureId)}*/}
            <Form {...formProps} layout="vertical">
                <Row gutter={[32, 32]} style={{marginTop: 32}}>
                    {/* Data Section */}
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <Space>
                                    <DatabaseOutlined/>
                                    <p>{translate("reservations.data.title", "Données")}</p>
                                </Space>
                            }
                            headStyle={{padding: "1rem"}}
                            bodyStyle={{padding: "2rem"}}
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
                                            value: value ? ( new Date(value).toLocaleDateString()): undefined,
                                        })}
                                    >
                                        <Input readOnly/>
                                    </Form.Item>

                                    <Form.Item
                                        label={translate("fields.updated_at")}
                                        name={["updatedAt"]}
                                        rules={[{required: true}]}
                                        getValueProps={(value) => ({
                                            value: value ? ( new Date(value).toLocaleDateString()): undefined,
                                        })}
                                    >
                                        <Input readOnly/>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Actions Section */}
                    <Col xs={24} lg={8}>
                        <Card
                            title={
                                <Space>
                                    <EditOutlined/>
                                    <p>{translate("reservations.actions.title", "Actions")}</p>
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
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};
