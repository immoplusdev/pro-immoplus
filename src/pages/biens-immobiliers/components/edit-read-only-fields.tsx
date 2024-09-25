import React from "react";
import {BaseRecord} from "@refinedev/core";
import {Card, Space} from "antd";
import {DatabaseOutlined} from "@ant-design/icons";
import {ReadOnlyFormField} from "@/lib/ts-utilities";

export const BienImmobilierDataFields: React.FC<{ translate: any; data?: BaseRecord }> = ({translate, data}) => {
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