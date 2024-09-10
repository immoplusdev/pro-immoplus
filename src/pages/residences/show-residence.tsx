import React, {useState} from "react";
import {useShow, useTranslate} from "@refinedev/core";
import {
    Show,
    TextField,
    BooleanField,
    NumberField,
    DateField,
} from "@refinedev/antd";

import {Form, Tag, Upload, Image, UploadFile} from "antd";
import {ColList} from "@/components/layout";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {StatusValidationResidenceTag} from "@/pages/residences/components";
import {LargeThumbnail} from "@/components";
import {getImageUrl} from "@/lib/helpers";
import {defaultFileUploadProps, FileType, getBase64, ImagesToUploadFilesFormat} from "@/components/form";
import {PlusOutlined} from "@ant-design/icons";


export const ShowResidence = () => {
    const translate = useTranslate();
    const {queryResult} = useShow();
    const {data, isLoading} = queryResult;
    const record = data?.data;
    const formPropName = [
        {label: translate("fields.id"), content: record?.id},
        {label: translate("fields.nom"), content: record?.nom},
        {label: translate("residences.fields.type_residence"), content: record?.typeResidence},
        {label: translate("fields.description"), content: record?.description},
        {label: translate("fields.adresse"), content: record?.adresse},
        {label: translate("fields.residence_disponible"), content: record?.residenceDisponible},
        {label: translate("residences.status_validation.rejete"), content: record?.statusValidation},
        {label: translate("fields.prix_reservation"), content: record?.prixReservation},
        {label: translate("residences.fields.nombre_max_occupants"), content: record?.nombreMaxOccupants},
        {label: translate("residences.fields.animaux_autorises"), content: record?.animauxAutorises},
        {label: translate("residences.fields.fetes_autorises"), content: record?.fetesAutorises},
        {label: translate("fields.created_at"), content: record?.createAt},
        {label: translate("fields.updated_at"), content: record?.updateAt},
    ]

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    // TODO: Régler les bugs...
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    return (
        <Show isLoading={isLoading}>
            <Form
                labelCol={{span: 200}}
                wrapperCol={{span: 130}}
                layout="vertical"
                style={{
                    maxWidth: 1000,
                    // fontWeight: 700,
                }}

            >
                <div className={"w-full mb-4"}>
                    <Upload
                        {...defaultFileUploadProps}
                        accept="image/*"
                        fileList={ImagesToUploadFilesFormat(record?.miniatureId, record?.images)}
                        onPreview={handlePreview}
                    >
                        {previewImage && (
                            <Image
                                wrapperStyle={{display: 'none'}}
                                preview={{
                                    visible: previewOpen,
                                    onVisibleChange: (visible: boolean) => setPreviewOpen(visible),
                                    afterOpenChange: (visible: boolean) => !visible && setPreviewImage(''),
                                }}
                                src={previewImage}
                            />)}
                    </Upload>
                </div>

                <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
                    {formPropName.map((data, index) => (
                        data.content === record?.statusValidation ?

                            <Form.Item label={data.label}>
                                <Tag color="warning" style={{
                                    width: 300,
                                    height: 30,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>{data?.content}</Tag>
                            </Form.Item>

                            :
                            <ReadOnlyFormField
                                key={index}
                                label={data.label}
                                content={data.content}
                                isLoading={isLoading}
                            />

                    ))}
                </ColList>
            </Form>
        </Show>
    );
};
