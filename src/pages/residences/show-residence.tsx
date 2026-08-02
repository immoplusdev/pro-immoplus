import React, {useState} from "react";
import {useShow, useTranslate} from "@refinedev/core";
import {
    Show,
    TextField,
    NumberField,
    DateField,
} from "@refinedev/antd";

import {Form, Upload, Image, UploadFile, UploadProps, Typography} from "antd";
import {ColList} from "@/components/layout";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {VerificationBadge, OutlineTag} from "@/components/table";
import {ImageCarousel} from "@/components/images/image-carousel";
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import {getCarouselUrls} from "@/lib/helpers";

const {Title} = Typography;

export const ShowResidence = () => {
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
                    maxWidth: 1000,
                }}
            >
                <div className={"w-full mb-4"}>
                    <ImageCarousel images={getCarouselUrls(record?.miniatureId, record?.images)}/>
                </div>


                <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
                    <ReadOnlyFormField label={translate("fields.nom")} content={record?.nom} isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.type_residence")}
                                       content={record?.typeResidence} isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("fields.description")} content={record?.description}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("fields.adresse")} content={record?.adresse}
                                       isLoading={isLoading}/>

                    <>
                        <Title level={5}>{translate("residences.fields.residence_disponible")}</Title>
                        <VerificationBadge verified={!!record?.residenceDisponible}/>
                    </>

                    <Form.Item label={translate("fields.status_validation")}>
                        <OutlineTag color="#B86B0A">{record?.statusValidation}</OutlineTag>
                    </Form.Item>

                    <ReadOnlyFormField label={translate("fields.prix_reservation")} content={record?.prixReservation}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("tags.reduction")} content={record?.reduction ? `${record.reduction}%` : '-'}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.tarif_horaire")} content={record?.tarifHoraire}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("fields.ville")} content={record?.ville}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("fields.commune")} content={record?.commune}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.nombre_max_occupants")}
                                       content={record?.nombreMaxOccupants} isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.heure_entree")} content={record?.heureEntree}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.heure_depart")} content={record?.heureDepart}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.duree_min_sejour")} content={record?.dureeMinSejour}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.duree_max_sejour")} content={record?.dureeMaxSejour}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("fields.regles_supplementaires")} content={record?.reglesSupplementaires}
                                       isLoading={isLoading}/>

                    <>
                        <Title level={5}>{translate("residences.fields.animaux_autorises")}</Title>
                        <VerificationBadge verified={!!record?.animauxAutorises}/>
                    </>
                    <>
                        <Title level={5}>{translate("residences.fields.fetes_autorises")}</Title>
                        <VerificationBadge verified={!!record?.fetesAutorises}/>
                    </>
                    <>
                        <Title level={5}>{translate("residences.fields.has_jacuzzi")}</Title>
                        <VerificationBadge verified={!!record?.hasJacuzzi}/>
                    </>
                    <>
                        <Title level={5}>{translate("residences.fields.has_piscine")}</Title>
                        <VerificationBadge verified={!!record?.hasPiscine}/>
                    </>

                    <ReadOnlyFormField label={translate("residences.fields.views_count")} content={record?.viewsCount}
                                       isLoading={isLoading}/>

                    <ReadOnlyFormField label={translate("residences.fields.likes_count")} content={record?.likesCount}
                                       isLoading={isLoading}/>

                    <>
                        <Title level={5}>{translate("fields.created_at")}</Title>
                        <DateField value={record?.createdAt}/></>
                    <>
                        <Title level={5}>{translate("fields.updated_at")}</Title>
                        <DateField value={record?.updatedAt}/>
                    </>

                </ColList>
            </Form>
        </Show>
    );
};
