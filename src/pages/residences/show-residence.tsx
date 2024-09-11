import React, {useState} from "react";
import {useShow, useTranslate} from "@refinedev/core";
import {
    Show,
    TextField,
    BooleanField,
    NumberField,
    DateField,
} from "@refinedev/antd";

import {Form, Tag, Upload, Image, UploadFile, UploadProps, Typography} from "antd";
import {ColList} from "@/components/layout";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {StatusValidationResidenceTag} from "@/pages/residences/components";
import {LargeThumbnail} from "@/components";
import {getImageUrl} from "@/lib/helpers";
import {defaultFileUploadProps, FileType, getBase64, ImagesToUploadFilesFormat} from "@/components/form";
import {PlusOutlined} from "@ant-design/icons";

const {Title} = Typography;

export const ShowResidence = () => {
    const translate = useTranslate();
    const {queryResult} = useShow();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const {data, isLoading} = queryResult;
    const record = data?.data;
    const [fileList, setFileList] = useState<UploadFile[]>(ImagesToUploadFilesFormat(record?.miniatureId, record?.images))



    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };
    const handleChange: UploadProps['onChange'] = ({fileList: newFileList}) =>
        setFileList(newFileList);

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
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}
                    >
                    </Upload>
                    {previewImage && (
                        <Image
                            wrapperStyle={{display: 'none'}}
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible: boolean) => setPreviewOpen(visible),
                                afterOpenChange: (visible: boolean) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                        />
                    )}

                </div>

                <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
                    <ReadOnlyFormField label={translate("fields.id")} content={record?.id} isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("fields.nom")} content={record?.nom} isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.type_residence")}
                                       content={record?.typeResidence} isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("fields.description")} content={record?.description}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("fields.adresse")} content={record?.adresse}
                                       isLoading={isLoading}/>

                    <>
                        <Title level={5}>{translate("residences.fields.residence_disponible")}</Title>
                        <BooleanField value={record?.residenceDisponible}/>
                    </>

                    <Form.Item label={translate("fields.status_validation")}>
                        <Tag color="warning" style={{
                            width: 300,
                            height: 30,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>{record?.statusValidation}</Tag>
                    </Form.Item>
                    <ReadOnlyFormField label={translate("fields.prix_reservation")} content={record?.prixReservation}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.nombre_max_occupants")}
                                       content={record?.nombreMaxOccupants} isLoading={isLoading}/>

                    <>
                        <Title level={5}>{translate("residences.fields.animaux_autorises")}</Title>
                        <BooleanField value={record?.animauxAutorises}/>
                    </>
                    <>
                        <Title level={5}>{translate("residences.fields.fetes_autorises")}</Title>
                        <BooleanField value={record?.fetesAutorises}/>
                    </>
                    <>
                        <Title level={5}>{translate("fields.created_at")}</Title>
                        <DateField value={record?.createAt}/></>
                    <>
                        <Title level={5}>{translate("fields.updated_at")}</Title>
                        <DateField value={record?.updateAt}/>
                    </>

                </ColList>
            </Form>
        </Show>
    );
};
