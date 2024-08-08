import React from "react";
import {Form, Input, Checkbox, DatePicker, FormProps, Select, TextArea} from "antd";
import {useTranslate} from "@refinedev/core";
import dayjs from "dayjs";
import {defaultModalFormProps} from "@/configs/form.config";
import {ColList} from "@/components/layout/col-list";
import {statusValidationResidence} from "@/core/domain/residences/status-validation-residence";

type Props = {
    createFormProps: FormProps
}
export const CreateResidence = ({createFormProps}: Props) => {
    const translate = useTranslate();
    return (
        <Form  {...createFormProps} {...defaultModalFormProps} className="mt-8">

            <ColList
                colProps={{
                    xl: {span: 12},
                    sm: {span: 24}
                }}
                rowProps={{gutter: 16}}
            >
                <Form.Item
                    label={translate("fields.nom")}
                    name={["nom"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}

                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label={translate("residences.fields.type_residence")}
                    name={["typeResidence"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}

                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label={translate("fields.description")}
                    name={["description"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}


                >
                    <TextArea rows={4} placeholder="maxLength is 6" maxLength={6}/>
                </Form.Item>
                <Form.Item
                    label={translate("fields.adresse")}
                    name={["adresse"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}

                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    valuePropName="checked"
                    name={["residenceDisponible"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Checkbox>{translate("residences.fields.residence_disponible")}</Checkbox>
                </Form.Item>
                <Form.Item
                    label={translate("fields.status_validation")}
                    name={["statusValidation"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}

                >
                    <Select options={statusValidationResidence.map(item => ({
                        value: item,
                        label: <span>{translate(`residences.status_validation.${item}`)}</span>
                    }))}/>
                </Form.Item>
                <Form.Item
                    label={translate("residences.fields.prixReservation")}
                    name={["prixReservation"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}

                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label={translate("residences.fields.nombreMaxOccupants")}
                    name={["nombreMaxOccupants"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}

                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label={translate("residences.fields.animauxAutorises")}
                    valuePropName="checked"
                    name={["animauxAutorises"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}

                >
                    <Checkbox>Animaux Autorises</Checkbox>
                </Form.Item>
                <Form.Item
                    label={translate("residences.fields.fetesAutorises")}
                    valuePropName="checked"
                    name={["fetesAutorises"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}

                >
                    <Checkbox>Fetes Autorises</Checkbox>
                </Form.Item>
                <Form.Item
                    label={translate("residences.fields.createdAt")}
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
                    label={translate("residences.fields.updatedAt")}
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
            </ColList>
        </Form>
    );
};
