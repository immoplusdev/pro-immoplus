import React from "react";
import {useShow, useTranslate} from "@refinedev/core";
import {Show, DateField, ImageField} from "@refinedev/antd";
import {Form, Typography} from "antd";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";

const {Title} = Typography;

export const ShowFurniture = () => {
    const translate = useTranslate();
    const {queryResult} = useShow();
    const {data, isLoading} = queryResult;

    const record = data?.data;

    const images: string[] = record?.images
        ? (Array.isArray(record.images) ? record.images : [record.images])
        : [];

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
                <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
                    <ReadOnlyFormField label={translate("furnitures.fields.titre")} content={record?.titre}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("furnitures.fields.type")} content={record?.type}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("furnitures.fields.category")} content={record?.category}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("furnitures.fields.etat")} content={record?.etat}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("furnitures.fields.prix")}
                                       content={record?.prix ? formatAmount(record.prix) : ""}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("furnitures.fields.status")} content={record?.status}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("fields.description")} content={record?.description}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("furnitures.fields.adresse")} content={record?.adresse}
                                       isLoading={isLoading}/>
                    <ReadOnlyFormField label={translate("users.fields.owner")}
                                       content={record?.owner?.firstname ? `${record.owner.firstname} ${record.owner.lastname ?? ""}` : record?.owner}
                                       isLoading={isLoading}/>
                    <>
                        <Title level={5}>{translate("fields.created_at")}</Title>
                        <DateField value={record?.createdAt}/>
                    </>
                </ColList>

                {images.length > 0 && (
                    <>
                        <Title level={5}>{translate("fields.images")}</Title>
                        <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                            {images.map((imageId: string, index: number) => (
                                <ImageField
                                    key={index}
                                    value={getApiFileUrl(imageId)}
                                    width={200}
                                />
                            ))}
                        </div>
                    </>
                )}
            </Form>
        </Show>
    );
};
