import React from "react";
import { useShow, useTranslate } from "@refinedev/core";
import {
  Show,
  BooleanField,
} from "@refinedev/antd";
import {Form, Tag, Typography} from "antd";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";
import {ReadOnlyFormField} from "@/lib/ts-utilities";

const { Title } = Typography;

export const ShowBienImmobilier = () => {
  const translate = useTranslate();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;
  const formPropName = [
    {label: translate("fields.name"), content: record?.nom},
    {label: translate("biens-immobiliers.fields.type_bien_immobilier"), content: record?.typeBienImmobilier},
    {label: translate("fields.description"), content: record?.description},
    {label: translate("fields.images"), content: record?.images},
    {label: translate("fields.adresse"), content: record?.adresse},
    {label: translate("fields.status_validation"), content: record?.statusValidation},
    {label: translate("biens-immobiliers.fields.prix"), content: record?.prix},
    {label: translate("biens-immobiliers.fields.featured"), content: record?.featured},
    {label: translate("biens-immobiliers.fields.a_louer"), content: record?.aLouer},
    {label: translate("biens-immobiliers.fields.disponible"), content: record?.bienImmobilierDisponible},
    {label: translate("residences.fields.nombre_max_occupants"), content: record?.nombreMaxOccupants},
    {label: translate("residences.fields.animaux_autorises"), content: record?.animauxAutorises},
    {label: translate("residences.fields.fetes_autorises"), content: record?.fetesAutorises},
    {label: translate("fields.regles_supplementaires"), content: record?.reglesSupplementaires},
    {label: translate("fields.created_at"), content: record?.createdAt},
  ]

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
          <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
            {formPropName.map((data, index) =>(
              data.content === record?.statusValidation
                  ? (
                      <Form.Item label={data.label}>
                        <Tag color="warning" style={{width: 300, height: 30 , display: "flex", alignItems: "center", justifyContent: "center"}}>{data?.content}</Tag>
                      </Form.Item>
                  ) : data.content === record?.fetesAutorises ?
                      (
                          <Form.Item label={data.label}>
                            <BooleanField value={record?.fetesAutorises } />
                          </Form.Item>
                      )
                      : data.content === record?.featured ?
                          (
                              <Form.Item label={data.label}>
                                <BooleanField value={record?.bienImmobilierDisponible} />
                              </Form.Item>
                          ) :
                    <ReadOnlyFormField
                        key={index}
                        label={data.label}
                        content={data.content}
                        isLoading={isLoading}
                    />
            ))}
          </ColList>
        </Form>
        {/*<Title level={5}>*/}
        {/*  {translate("biens-immobiliers.fields.images")}*/}
        {/*</Title>*/}
        {/*{record?.images?.map((item: any) => (*/}
        {/*    <TagField value={item} key={ite
        m} />*/}
        {/*))}*/}
        {/*<Title level={5}>*/}
        {/*  {translate("biens-immobiliers.fields.bienImmobilierDisponible")}*/}
        {/*</Title>*/}
        {/*<BooleanField value={record?.bienImmobilierDisponible} />*/}
        {/*<Title level={5}>*/}
        {/*  {translate("biens-immobiliers.fields.updatedAt")}*/}
        {/*</Title>*/}
        {/*<DateField value={record?.updatedAt} />*/}

      </Show>
  );
};
