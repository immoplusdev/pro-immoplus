import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Card, Col, Form, Row, Select, Space, Checkbox } from "antd";
import { useTranslate } from "@refinedev/core";
import { BaseRecord } from "@refinedev/core";
import { enumToList, ReadOnlyFormField } from "@/lib/ts-utilities";
import {bienImmobilierDisponible, StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import { DatabaseOutlined, EditOutlined } from "@ant-design/icons";
import {ImageCarousel} from "@/components/images/image-carousel";
import {getCarouselUrls} from "@/lib/helpers";

// Main Edit Component
export const EditBienImmobilier: React.FC = () => {
    const translate = useTranslate();
    const { formProps, saveButtonProps, queryResult } = useForm();
    const biensImmobiliersData = queryResult?.data?.data;

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                {/* Image Carousel and File Upload */}
                <div className="w-50 mb-4">
                    <ImageCarousel
                        images={getCarouselUrls(biensImmobiliersData?.miniatureId, biensImmobiliersData?.images)}
                    />
                </div>
                <Row gutter={[32, 32]} style={{marginTop: 32}}>
                    <Col xs={24} md={24} lg={16}>
                        <DataField translate={translate} data={biensImmobiliersData}/>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <ActionsField translate={translate}/>
                    </Col>
                </Row>
            </Form>
        </Edit>
    );
};

// DataField Component for Read-Only Data
const DataField: React.FC<{ translate: any; data?: BaseRecord }> = ({translate, data}) => {
    return (
        <Card
            title={
                <Space>
                    <DatabaseOutlined />
                    <p>{translate("biens_immobiliers.fields.data")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem" }}
            bodyStyle={{ padding: "2rem", display: "flex", flexDirection: "row" }}
        >
            <Card style={{ border: "none", width: "50%" }}>
                <ReadOnlyFormField label={translate("fields.nom")} content={data?.nom} />
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.type_bien_immobilier")} content={data?.typeBienImmobilier} />
                <ReadOnlyFormField label={translate("fields.description")} content={data?.description} />
                <ReadOnlyFormField label={translate("fields.adresse")} content={data?.adresse} />
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.prix")} content={data?.prix} />
                <ReadOnlyFormField label={translate("fields.created_at")} content={new Date(data?.createdAt).toLocaleDateString()} />
                <ReadOnlyFormField label={translate("fields.updated_at")} content={new Date(data?.updatedAt).toLocaleDateString()} />
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.a_louer")} content={data?.aLouer ? "Yes" : "No"} />
            </Card>
            <Card style={{ width: "50%", border: "none" }}>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.nombre_max_occupants")} content={data?.nombreMaxOccupants} />
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.animaux_autorises")} content={data?.animauxAutorises ? "Oui" : "Non"} />
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.fetes_autorises")} content={data?.fetesAutorises ? "Oui" : "Non"} />
                <ReadOnlyFormField label={translate("fields.regles_supplementaires")} content={data?.reglesSupplementaires} />
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.featured")} content={data?.featured ? "Yes" : "No"} />
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.a_louer")} content={data?.aLouer ? "Yes" : "No"} />
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.featured")} content={data?.aLouer ? "Yes" : "No"} />
            </Card>
        </Card>
    );
};

// ActionsField Component for Editable Actions
const ActionsField: React.FC<{ translate: any }> = ({ translate }) => {
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
                label={translate("biens_immobiliers.fields.bien_immobilier_disponible")}
                style={{ width: 300 }}
                name={["bienImmobilierDisponible"]}
                rules={[{ required: true }]}
            >
                <Select options={enumToList(bienImmobilierDisponible).map(item => ({
                    value: item,
                    label: <span>{translate(`biens_immobiliers.fields.${item}`)}</span>
                }))}/>
                {/*<Checkbox>Bien Immobilier Disponible</Checkbox>*/}
            </Form.Item>
            {renderSelectFormItem("fields.status_validation", "statusValidation")}
        </Card>
    );
};

