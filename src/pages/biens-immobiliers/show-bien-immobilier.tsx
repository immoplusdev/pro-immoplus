import React, {useState} from "react";
import {useShow, useTranslate} from "@refinedev/core";
import {
    Show,
    BooleanField, ImageField, TextField, NumberField, DateField,
} from "@refinedev/antd";
import {Form, Image, Tag, Typography, Upload, UploadFile, UploadProps} from "antd";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {getImageUrl} from "@/lib/helpers";
import {
    defaultFileUploadProps,
    FileType,
    getBase64,
    getFileIdFromEvent,
} from "@/components/form";
import {PlusOutlined} from "@ant-design/icons";

const {Title} = Typography;

export const ShowBienImmobilier = () => {
    const translate = useTranslate();
    const {queryResult} = useShow();
    const {data, isLoading} = queryResult;

    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Form
                labelCol={{span: 200}}
                wrapperCol={{span: 130}}
                layout="vertical"
                style={{
                    alignContent: "center",
                }}
            >
                {/*<div className={"w-full mb-4"}>*/}
                {/*    <Upload*/}
                {/*        {...defaultFileUploadProps}*/}
                {/*        accept="image/*"*/}
                {/*        fileList={fileList}*/}
                {/*        onPreview={handlePreview}*/}
                {/*        onChange={handleChange}*/}
                {/*    >*/}
                {/*    </Upload>*/}
                {/*    {previewImage && (*/}
                {/*        <Image*/}
                {/*            wrapperStyle={{display: 'none'}}*/}
                {/*            preview={{*/}
                {/*                visible: previewOpen,*/}
                {/*                onVisibleChange: (visible: boolean) => setPreviewOpen(visible),*/}
                {/*                afterOpenChange: (visible: boolean) => !visible && setPreviewImage(''),*/}
                {/*            }}*/}
                {/*            src={previewImage}*/}
                {/*        />*/}
                {/*    )}*/}
                {/*</div>*/}
                <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>

                    {/*<Title level={5}>{translate("fields.images")}</Title>*/}
                    {/*<Image.PreviewGroup items={record?.images?.map((data: string) => getImageUrl(data))}>*/}
                    {/*    <Image src={getImageUrl(record?.images[0])} width={200}/>*/}
                    {/*</Image.PreviewGroup>*/}
                    <ReadOnlyFormField label={translate("fields.name")} content={record?.nom}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("biens_immobiliers.fields.type_bien_immobilier")}
                                       content={record?.typeBienImmobilier} isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("fields.description")} content={record?.description}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("fields.adresse")} content={record?.adresse}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("fields.status_validation")}
                                       content={record?.statusValidation} isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("biens_immobiliers.fields.prix")} content={record?.prix}
                                       isLoading={isLoading}/>
                    <>
                        <Title level={5}>{translate("biens_immobiliers.fields.featured")}</Title>
                        <BooleanField value={record?.featured}/>
                    </>
                    <>
                        <Title level={5}>{translate("biens_immobiliers.fields.a_louer")}</Title>
                        <BooleanField value={record?.aLouer}/>
                    </>
                    <>
                        <Title level={5}>{translate("biens_immobiliers.fields.disponible")}</Title>
                        <BooleanField value={record?.bienImmobilierDisponible}/>
                    </>
                    <>
                        <Title level={5}>{translate("residences.fields.nombre_max_occupants")}</Title>
                        <NumberField value={record?.nombreMaxOccupants ?? ""}/>
                    </>
                    <>
                        <Title level={5}>{translate("residences.fields.animaux_autorises")}</Title>
                        <BooleanField value={record?.animauxAutorises}/>
                    </>
                    <>
                        <Title level={5}>{translate("residences.fields.fetes_autorises")}</Title>
                        <BooleanField value={record?.fetesAutorises}/>
                    </>
                    <ReadOnlyFormField label={translate("fields.regles_supplementaires")}
                                       content={record?.reglesSupplementaire} isLoading={isLoading}/>
                    <>
                        <Title level={5}>{translate("fields.created_at")}</Title>
                        <DateField value={record?.createdAt}/>
                    </>
                </ColList>

            </Form>

        </Show>
    );
};
