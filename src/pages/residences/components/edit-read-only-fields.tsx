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
            title={
                <Space>
                    <DatabaseOutlined />
                    <p>{translate("Données")}</p>
                </Space>
            }
            headStyle={{ padding: "1rem", border:"0.5px solid black"}}
            bodyStyle={{ padding: "2rem", border:"0.5px solid black", display:"flex", flexDirection: "row" }}
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
                        style={{ width: "17vw", border: "0.5px solid black" }}
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
                    label={translate("residences.fields.duree_min_sejour")}
                    content={residencesData?.dureeMinSejour}
                />
                <ReadOnlyFormField
                    label={translate("residences.fields.duree_max_sejour")}
                    content={residencesData?.dureeMaxSejour}
                />
                {/*<ReadOnlyFormField*/}
                {/*    label={translate("fields.created_at")}*/}
                {/*    content={new Date(residencesData?.createdAt).toLocaleDateString()}*/}
                {/*/>*/}
                {/*<ReadOnlyFormField*/}
                {/*    label={translate("fields.updated_at")}*/}
                {/*    content={new Date(residencesData?.updatedAt).toLocaleDateString()}*/}
                {/*/>*/}
            </Card>
        </Card>
    );
};