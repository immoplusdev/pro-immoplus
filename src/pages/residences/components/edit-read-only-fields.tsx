import React from "react";
import {Card, Space} from "antd";
import {DatabaseOutlined} from "@ant-design/icons";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {BaseRecord} from "@refinedev/core";

type TranslateFunction = (key: string, params?: Record<string, any>) => string;
interface ReadOnlySectionProps {
    translate: TranslateFunction;
    residencesData?: BaseRecord;
}

export const ResidenceEditDataFields: React.FC<ReadOnlySectionProps> = ({ translate, residencesData }) => {
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