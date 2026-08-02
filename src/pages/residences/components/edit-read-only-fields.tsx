import React from "react";
import {Card, Form, Input, Space} from "antd";
import {DatabaseOutlined} from "@ant-design/icons";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {BaseRecord} from "@refinedev/core";
import {ImageCarousel} from "@/components/images/image-carousel";
import {getCarouselUrls} from "@/lib/helpers";

type TranslateFunction = (key: string, params?: Record<string, any>) => string;
interface ReadOnlySectionProps {
    translate: TranslateFunction;
    residencesData?: BaseRecord;
}

export const ResidenceDataFields: React.FC<ReadOnlySectionProps> = ({ translate, residencesData }) => {
    return (
        <Card
            style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
            title={
                <Space>
                    <DatabaseOutlined />
                    <p>{translate("Données")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem"}}
            bodyStyle={{ padding: "2rem", display:"flex", flexDirection: "row" }}
        >
            <Card style={{border: "none", width: "50%"}}>
                <Form.Item
                    label={translate("residences.fields.images")}
                    name={["images"]}
                    className="w-full flex justify-start items-start"
                >
                    <div className="w-50 h-50 flex items-center justify-center">
                        <ImageCarousel
                            images={getCarouselUrls(residencesData?.miniatureId, residencesData?.images)}
                        />
                    </div>
                </Form.Item>


                <ReadOnlyFormField label={translate("fields.nom")} content={residencesData?.nom}/>
                <ReadOnlyFormField
                    label={translate("residences.fields.type_residence")}
                    content={residencesData?.typeResidence}
                />
                <Form.Item label={translate("fields.description")} name={["description"]}>
                    <Input.TextArea
                        autoSize={{ minRows: 3, maxRows: 8 }}
                        style={{ width: "17vw", border: "1px solid #E8E9EE", borderRadius: 6 }}
                    />
                </Form.Item>
                <ReadOnlyFormField
                    label={translate("fields.adresse")}
                    content={residencesData?.adresse}
                />
                <ReadOnlyFormField
                    label={translate("fields.prix_reservation")}
                    content={residencesData?.prixReservation}
                />

            </Card>

            <Card style={{width: "50%", border: "none"}}>
                <ReadOnlyFormField
                    label={translate("residences.fields.heure_entree")}
                    content={residencesData?.heureEntree}
                />
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
                    label={translate("residences.fields.has_jacuzzi")}
                    content={residencesData?.hasJacuzzi ? "Oui" : "Non"}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.has_piscine")}
                    content={residencesData?.hasPiscine ? "Oui" : "Non"}
                />
                <ReadOnlyFormField
                    label={translate("fields.regles_supplementaires")}
                    content={residencesData?.reglesSupplementaires}
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
                    label={translate("fields.ville")}
                    content={residencesData?.ville}
                />
                <ReadOnlyFormField
                    label={translate("fields.commune")}
                    content={residencesData?.commune}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.tarif_horaire")}
                    content={residencesData?.tarifHoraire}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.views_count")}
                    content={residencesData?.viewsCount}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.likes_count")}
                    content={residencesData?.likesCount}
                />
            </Card>
        </Card>
    );
};