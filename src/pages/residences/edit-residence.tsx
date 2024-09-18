import React, {useState} from "react";
import { Edit, useForm } from "@refinedev/antd";
import {
    Card,
    Form,
    Select, Space
} from "antd";
import { useTranslate} from "@refinedev/core";

import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";
import {enumToList, ReadOnlyFormField} from "@/lib/ts-utilities";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import {ImageCarousel} from "@/components/images/image-carousel";
import {getCarouselUrls} from "@/lib/helpers";

export const EditResidence = () => {
  const translate = useTranslate();
    const {formProps, saveButtonProps, queryResult} = useForm();
    const residencesData = queryResult?.data?.data;


    return (
      <Edit saveButtonProps={saveButtonProps}>
          <Form {...formProps} layout="vertical">
              <div className={"w-full mb-4"}>
                  <ImageCarousel images={getCarouselUrls(residencesData?.miniatureId, residencesData?.images)}/>
              </div>
              <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
                  <ReadOnlyFormField label={translate("fields.nom")} content={residencesData?.nom}/>
                  <ReadOnlyFormField label={translate("residences.fields.type_residence")}
                                     content={residencesData?.typeResidence}/>
                  <ReadOnlyFormField label={translate("fields.description")} content={residencesData?.description}/>

                  <ReadOnlyFormField label={translate("fields.adresse")} content={residencesData?.adresse}/>
                  <Form.Item
                      label={translate("residences.fields.residence_disponible")}
                      style={{width: 300}}
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
                      label={translate("fields.status_validation")}
                      style={{width: 300}}
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
                  <ReadOnlyFormField label={translate("fields.prix_reservation")}
                                     content={residencesData?.prixReservation}/>
                  <ReadOnlyFormField label={translate("residences.fields.duree_min_sejour")}
                                     content={residencesData?.dureeMinSejour}/>
                  <ReadOnlyFormField label={translate("residences.fields.duree_max_sejour")}
                                     content={residencesData?.dureeMaxSejour}/>
                  <ReadOnlyFormField label={translate("residences.fields.heure_entree")}
                                     content={residencesData?.heureEntree}/>
                  <ReadOnlyFormField label={translate("residences.fields.heure_depart")}
                                     content={residencesData?.heureDepart}/>
                  <ReadOnlyFormField label={translate("residences.fields.nombre_max_occupants")}
                                     content={residencesData?.nombreMaxOccupants}/>
                  <ReadOnlyFormField label={translate("residences.fields.animaux_autorises")}
                                     content={residencesData?.animauxAutorises ? "Oui" : "Non"}/>
                  <ReadOnlyFormField label={translate("residences.fields.fetes_autorises")}
                                     content={residencesData?.fetesAutorises ? "Oui" : "Non"}/>
                  <ReadOnlyFormField label={translate("fields.regles_supplementaires")}
                                     content={residencesData?.reglesSupplementaires}/>
                  <ReadOnlyFormField label={translate("fields.created_at")}
                                     content={new Date(residencesData?.createdAt).toLocaleDateString()}/>
                  <ReadOnlyFormField label={translate("fields.updated_at")}
                                     content={new Date(residencesData?.updatedAt).toLocaleDateString()}/>

              </ColList>
              <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
                  <ReadOnlyFormField label={translate("fields.created_at")}
                                     content={new Date(residencesData?.createdAt).toLocaleDateString()}/>
                  <ReadOnlyFormField label={translate("fields.updated_at")}
                                     content={new Date(residencesData?.updatedAt).toLocaleDateString()}/>
              </ColList>
          </Form>
      </Edit>
    );
};

export const readOnlyData = () =>{
    return(
        <Card
            title={
                <Space>
                    {/* @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66 */}
                    <ShopOutlined />
                    <p>Company info</p>
                </Space>
            }
            headStyle={{
                padding: "1rem",
            }}
            bodyStyle={{
                padding: "0",
            }}
        >
            <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>

            </ColList>


        </Card>
    )
}
