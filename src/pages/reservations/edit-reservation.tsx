import React from "react";
import {Edit, useForm, useSelect} from "@refinedev/antd";
import {Form, Input, Checkbox, DatePicker, Select} from "antd";
import {useTranslate} from "@refinedev/core";
import dayjs from "dayjs";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";

export const EditReservation = () => {
    const translate = useTranslate();
    const {formProps, saveButtonProps, queryResult} = useForm();

    const reservationsData = queryResult?.data?.data;

    const {selectProps: residenceSelectProps} = useSelect({
        resource: "residences",
        defaultValue: reservationsData?.residence,
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
                    <Form.Item
                        label={translate("fields.id")}
                        name={["id"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input readOnly disabled/>
                    </Form.Item>
                    <Form.Item
                        label={translate("reservations.fields.status_reservation")}
                        name={["statusReservation"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input readOnly disabled/>
                    </Form.Item>
                    <Form.Item
                        label={translate("reservations.fields.status_facture")}
                        name={["statusFacture"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input readOnly disabled/>
                    </Form.Item>
                    <Form.Item
                        label={translate("reservations.fields.retrait_pro_effectue")}
                        valuePropName="checked"
                        name={["retraitProEffectue"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Checkbox>Retrait Pro Effectue</Checkbox>
                    </Form.Item>
                    <Form.Item
                        label={translate(
                            "reservations.fields.montant_total_reservation",
                        )}
                        name={["montantTotalReservation"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input readOnly disabled/>
                    </Form.Item>
                    <Form.Item
                        label={translate(
                            "reservations.fields.montant_reservation_sans_commission",
                        )}
                        name={["montantReservationSansCommission"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input readOnly disabled/>
                    </Form.Item>
                    <Form.Item
                        label={translate("fields.notes")}
                        name={["notes"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input readOnly disabled/>
                    </Form.Item>
                    <Form.Item
                        label={translate("fields.client_phone_number")}
                        name={["clientPhoneNumber"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input readOnly disabled/>
                    </Form.Item>
                    <Form.Item
                        label={translate("fields.created_at")}
                        name={["createdAt"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        getValueProps={(value) => ({
                            value: value ? dayjs(value) : undefined,
                        })}
                    >
                        <DatePicker/>
                    </Form.Item>
                    <Form.Item
                        label={translate("fields.updated_at")}
                        name={["updatedAt"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        getValueProps={(value) => ({
                            value: value ? dayjs(value) : undefined,
                        })}
                    >
                        <DatePicker/>
                    </Form.Item>
                    <Form.Item
                        label={translate("residences.fields.residence")}
                        name={"residence"}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Select {...residenceSelectProps} />
                    </Form.Item>
                    <Form.Item
                        label={translate("fields.client")}
                        name={["client", "id"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input readOnly disabled/>
                    </Form.Item>
                    <Form.Item
                        label={translate("reservations.fields.proprietaire")}
                        name={["proprietaire", "id"]}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input readOnly disabled/>
                    </Form.Item>
                    <></>
                </ColList>
            </Form>
        </Edit>
    );
};
