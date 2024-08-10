import React from "react";
import {Form, Input, Checkbox, FormProps, Select, InputNumber, Upload} from "antd";
import {useTranslate} from "@refinedev/core";
import {defaultModalFormProps} from "@/configs/form.config";
import {ColList} from "@/components/layout";
import {typesResidence, statusValidationResidence} from "@/core/domain/residences";
import {getCurrencySymbol} from "@/lib/helpers";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {PlusOutlined} from "@ant-design/icons";
import {defaultFileUploadProps, getFileIdFromEvent} from "@/components/form/file";
import {LocationPicker} from "@/components/form/map";


type Props = {
    createFormProps: FormProps
}

const {TextArea} = Input;

export const CreateResidence = ({createFormProps}: Props) => {

    const translate = useTranslate();

    return (
        <Form  {...createFormProps} {...defaultModalFormProps} className="mt-8">
            <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
                <Form.Item
                    label={translate("fields.miniature")}
                    name={"miniature"}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    getValueFromEvent={getFileIdFromEvent}

                >
                    <Upload
                        {...defaultFileUploadProps}
                        accept="image/*"
                        multiple={false}
                    >
                        <button style={{border: 0, background: 'none'}} type="button">
                            <PlusOutlined/>
                            <div style={{marginTop: 8}}>{translate("files.file_upload.upload")}</div>
                        </button>
                    </Upload>
                </Form.Item>


                <Form.Item
                    label={translate("fields.location")}
                    name={"location"}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    getValueFromEvent={getFileIdFromEvent}

                >
                    <LocationPicker/>
                    <p>Test</p>
                </Form.Item>

            </ColList>
            <ColList
                rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}
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
                    label={translate("fields.prix_reservation")}
                    name={["prixReservation"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}

                >
                    <InputNumber suffix={getCurrencySymbol(0)} style={{width: '100%'}}/>
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
                    <Select options={typesResidence.map(item => ({
                        value: item,
                        label: <span>{translate(`residences.type_residence.${item}`)}</span>
                    }))}/>
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
                    label={translate("fields.description")}
                    name={["description"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}


                >
                    <TextArea rows={4}/>
                </Form.Item>

                <Form.Item
                    label={translate("residences.fields.residence_disponible")}
                    valuePropName="checked"
                    name={["residenceDisponible"]}
                >
                    <Checkbox>{translate("residences.fields.residence_disponible")}</Checkbox>
                </Form.Item>


                <Form.Item
                    label={translate("residences.fields.nombre_max_occupants")}
                    name={["nombreMaxOccupants"]}
                >
                    <InputNumber min={1}/>
                </Form.Item>
                <Form.Item
                    valuePropName="checked"
                    label={translate("residences.fields.animaux_autorises")}
                    name={["animauxAutorises"]}
                >
                    <Checkbox>{translate("residences.fields.animaux_autorises")}</Checkbox>
                </Form.Item>
                <Form.Item
                    label={translate("residences.fields.fetes_autorises")}
                    valuePropName="checked"
                    name={["fetesAutorises"]}
                >
                    <Checkbox>{translate("residences.fields.fetes_autorises")}</Checkbox>
                </Form.Item>
            </ColList>
        </Form>
    )
        ;
};
