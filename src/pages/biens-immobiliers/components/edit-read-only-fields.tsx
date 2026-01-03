import React from "react";
import {BaseRecord} from "@refinedev/core";
import {Card, Space, Form} from "antd";
import {DatabaseOutlined, UsergroupAddOutlined} from "@ant-design/icons";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {ImageCarousel} from "@/components/images/image-carousel";
import {getCarouselUrls} from "@/lib/helpers";
import {ShowUserButton} from "@/pages/users/components";

export const BienImmobilierDataFields: React.FC<{ translate: any; data?: BaseRecord }> = ({translate, data}) => {
    return (
        <Card
            title={
                <Space>
                    <DatabaseOutlined/>
                    <p>{translate("biens_immobiliers.fields.data")}</p>
                </Space>
            }
            headStyle={{padding: "1rem", border: "0.5px solid black"}}
            bodyStyle={{padding: "2rem", border: "0.5px solid black", display: "flex", flexDirection: "row"}}
        >
            <Card style={{border: "none", width: "50%"}}>
                <Form.Item
                    label={translate("residences.fields.images")}
                    name={["images"]}
                    className="w-full flex justify-start items-start"
                >
                    <div className="w-50 mb-4">
                        <ImageCarousel
                            images={getCarouselUrls(data?.miniatureId, data?.images)}
                        />
                    </div>
                </Form.Item>
                <ReadOnlyFormField label={translate("fields.nom")} content={data?.nom}/>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.type_bien_immobilier")}
                                   content={data?.typeBienImmobilier}/>
                <ReadOnlyFormField label={translate("fields.description")} content={data?.description}/>
                <ReadOnlyFormField label={translate("fields.adresse")} content={data?.adresse}/>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.prix")} content={data?.prix}/>
                <ShowUserButton id={data?.proprietaire} title={translate("users.common.see_owner")}/>
            </Card>
            <Card style={{width: "50%", border: "none"}}>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.nombre_max_occupants")}
                                   content={data?.nombreMaxOccupants}/>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.animaux_autorises")}
                                   content={data?.animauxAutorises ? "Oui" : "Non"}/>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.fetes_autorises")}
                                   content={data?.fetesAutorises ? "Oui" : "Non"}/>
                <ReadOnlyFormField label={translate("fields.regles_supplementaires")}
                                   content={data?.reglesSupplementaires}/>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.featured")}
                                   content={data?.featured ? "Yes" : "No"}/>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.a_louer")}
                                   content={data?.aLouer ? "Yes" : "No"}/>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.featured")}
                                   content={data?.aLouer ? "Yes" : "No"}/>
                <ReadOnlyFormField label={translate("biens_immobiliers.fields.a_louer")}
                                   content={data?.aLouer ? "Yes" : "No"}/>
            </Card>
        </Card>
    );
};
