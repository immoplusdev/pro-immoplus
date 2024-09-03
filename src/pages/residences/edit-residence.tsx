import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox, DatePicker } from "antd";
import { useTranslate } from "@refinedev/core";
import dayjs from "dayjs";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";

export const EditResidence = () => {
  const translate = useTranslate();
  const {formProps, saveButtonProps, queryResult} = useForm();

  const residencesData = queryResult?.data?.data;

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
              <Input/>
            </Form.Item>
            <>
              {(residencesData?.images as any[])?.map((item, index) => (
                  <Form.Item
                      key={index}
                      label={translate("fields.images")}
                      name={["images", index]}
                  >
                    <Input type="text"/>
                  </Form.Item>
              ))}
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
              <Input/>
            </Form.Item>
            <Form.Item
                label={translate("residences.fields.residence_disponible")}
                valuePropName="checked"
                name={["residenceDisponible"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
            >
              <Checkbox>Residence Disponible</Checkbox>
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
              <Input/>
            </Form.Item>
            <Form.Item
                label={translate("residences.fields.duree_min_sejour")}
                name={["dureeMinSejour"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
                label={translate("residences.fields.duree_min_sejour")}
                name={["dureeMaxSejour"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
                label={translate("residences.fields.heure_entree")}
                name={["heureEntree"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
                label={translate("residences.fields.heure_depart")}
                name={["heureDepart"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
                label={translate("residences.fields.nombre_max_occupants")}
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
                label={translate("residences.fields.animaux_autorises")}
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
                label={translate("fields.regles_supplementaires")}
                name={["reglesSupplementaires"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
            >
              <Input/>
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
          </ColList>
        </Form>
      </Edit>
  );
};
