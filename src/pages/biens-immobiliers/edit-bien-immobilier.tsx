import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import {Form, Input, Checkbox, DatePicker, Select} from "antd";
import { useTranslate } from "@refinedev/core";
import dayjs from "dayjs";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";
import {enumToList} from "@/lib/ts-utilities";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";

export const EditBienImmobilier = () => {
  const translate = useTranslate();
  const { formProps, saveButtonProps, queryResult } = useForm();

  const biensImmobiliersData = queryResult?.data?.data;

  return (
      <Edit saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
          <Form.Item
              label={translate("fields.nom")}
              name={["nom"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate(
                  "biens-immobiliers.fields.type_bien_immobilier",
              )}
              name={["typeBienImmobilier"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
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
            <Input />
          </Form.Item>
          <>
            {(biensImmobiliersData?.tags as any[])?.map(
                (item, index) => (
                    <Form.Item
                        key={index}
                        label={translate(
                            "biens-immobiliers.fields.tags",
                        )}
                        name={["tags", index]}
                    >
                      <Input type="text" />
                    </Form.Item>
                ),
            )}
          </>

          <>
            {(biensImmobiliersData?.images as any[])?.map(
                (item, index) => (
                    <Form.Item
                        key={index}
                        label={translate(
                            "fields.images",
                        )}
                        name={["images", index]}
                    >
                      <Input type="text" />
                    </Form.Item>
                ),
            )}
          </>
          <Form.Item
              label={translate("fields.adresse")}
              name={["adresse"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate(
                  "fields.status_validation",
              )}
              name={["statusValidation"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
              <Select options={enumToList(StatusReservation).map(item => ({
                  value: item,
                  label: <span>{translate(`reservations.status_reservation.${item}`)}</span>
              }))}/>
          </Form.Item>
          <Form.Item
              label={translate("biens-immobiliers.fields.prix")}
              name={["prix"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate("biens-immobiliers.fields.featured")}
              valuePropName="checked"
              name={["featured"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Checkbox>Featured</Checkbox>
          </Form.Item>
          <Form.Item
              label={translate("biens-immobiliers.fields.a_louer")}
              valuePropName="checked"
              name={["aLouer"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Checkbox>A Louer</Checkbox>
          </Form.Item>
          <Form.Item
              label={translate(
                  "biens-immobiliers.fields.disponible",
              )}
              valuePropName="checked"
              name={["bienImmobilierDisponible"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Checkbox>Bien Immobilier Disponible</Checkbox>
          </Form.Item>
          <Form.Item
              label={translate(
                  "residences.fields.nombre_max_occupants",
              )}
              name={["nombreMaxOccupants"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate(
                  "residences.fields.animaux_autorises",
              )}
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
              label={translate("residences.fields.fetes_autorises")}
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
              label={translate(
                  "fields.regles_supplementaires",
              )}
              name={["reglesSupplementaires"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
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
            <DatePicker />
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
            <DatePicker />
          </Form.Item>
          </ColList>
        </Form>
      </Edit>
  );
};
