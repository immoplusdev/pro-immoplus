import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Card, Col, Form, Row, Select, Space } from "antd";
import { BaseRecord, useTranslate } from "@refinedev/core";
import { enumToList, ReadOnlyFormField } from "@/lib/ts-utilities";
import {ResidenceValide, StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import { ImageCarousel } from "@/components/images/image-carousel";
import { getCarouselUrls } from "@/lib/helpers";
import { DatabaseOutlined, EditOutlined } from "@ant-design/icons";

export const EditResidence: React.FC = () => {
    const translate = useTranslate();
    const { formProps, saveButtonProps, queryResult } = useForm();
    const residencesData = queryResult?.data?.data;

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <div className="w-50 mb-4">
                    <ImageCarousel
                        images={getCarouselUrls(residencesData?.miniatureId, residencesData?.images)}
                    />
                </div>

                <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
                    <Col xs={24} md={24} lg={24} xl={16}>
                        <DataField translate={translate} residencesData={residencesData} />
                    </Col>
                    <Col xs={24} md={24} lg={24} xl={8}>
                        <ActionsField translate={translate} />
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};

type TranslateFunction = (key: string, params?: Record<string, any>) => string;

interface ReadOnlySectionProps {
    translate: TranslateFunction;
    residencesData?: BaseRecord;
}

export const DataField: React.FC<ReadOnlySectionProps> = ({ translate, residencesData }) => {
    return (
        <Card
            title={
                <Space>
                    <DatabaseOutlined />
                    <p>{translate("Données")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem" }}
            bodyStyle={{ padding: "2rem", display:"flex", flexDirection: "row" }}
        >
            <Card style={{border: "none", width: "50%"}}>
                <ReadOnlyFormField label={translate("fields.nom")} content={residencesData?.nom} />
                <ReadOnlyFormField
                    label={translate("residences.fields.type_residence")}
                    content={residencesData?.typeResidence}
                />
                <ReadOnlyFormField
                    label={translate("fields.description")}
                    content={residencesData?.description}
                />
                <ReadOnlyFormField
                    label={translate("fields.adresse")}
                    content={residencesData?.adresse}
                />
                <ReadOnlyFormField
                    label={translate("fields.prix_reservation")}
                    content={residencesData?.prixReservation}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.duree_min_sejour")}
                    content={residencesData?.dureeMinSejour}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.duree_max_sejour")}
                    content={residencesData?.dureeMaxSejour}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.heure_entree")}
                    content={residencesData?.heureEntree}
                />

            </Card>

            <Card style={{ width: "50%", border: "none" }}>
                <ReadOnlyFormField
                    label={translate("residences.fields.heure_depart")}
                    content={residencesData?.heureDepart}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.nombre_max_occupants")}
                    content={residencesData?.nombreMaxOccupants}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.animaux_autorises")}
                    content={residencesData?.animauxAutorises ? "Oui" : "Non"}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.fetes_autorises")}
                    content={residencesData?.fetesAutorises ? "Oui" : "Non"}
                />
                <ReadOnlyFormField
                    label={translate("fields.regles_supplementaires")}
                    content={residencesData?.reglesSupplementaires}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.residence_disponible")}
                    content={residencesData?.statusValidation}
                />
                <ReadOnlyFormField
                    label={translate("fields.created_at")}
                    content={new Date(residencesData?.createdAt).toLocaleDateString()}
                />
                <ReadOnlyFormField
                    label={translate("fields.updated_at")}
                    content={new Date(residencesData?.updatedAt).toLocaleDateString()}
                />
            </Card>
        </Card>
    );
};

export const ActionsField: React.FC<ReadOnlySectionProps> = ({ translate }) => {
    const renderSelectFormItem = (labelKey: string, name: string) => (
        <Form.Item
            label={translate(labelKey)}
            style={{ width: 300 }}
            name={name}
            rules={[{ required: true }]}
        >
            <Select
                options={enumToList(StatusReservation).map((item) => ({
                    value: item,
                    label: <span>{translate(`reservations.status_reservation.${item}`)}</span>,
                }))}
            />
        </Form.Item>
    );

    return (
        <Card
            title={
                <Space>
                    <EditOutlined />
                    <p>{translate("Actions")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem" }}
            bodyStyle={{ padding: "2rem" }}
        >
            <Form.Item
                label={translate("residences.fields.residence_disponible")}
                style={{width: 300}}
                name={["residenceDisponible"]}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select options={enumToList(ResidenceValide).map(item => ({
                    value: item,
                    label: <span>{translate(`reservations.fields.${item}`)}</span>
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
        </Card>
    );
};
