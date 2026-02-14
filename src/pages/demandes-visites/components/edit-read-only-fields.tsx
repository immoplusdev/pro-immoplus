import React from "react";
import {Button, Card, Space} from "antd";
import {ArrowRightOutlined, DatabaseOutlined, HomeOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {Link} from "react-router-dom";


interface VisiteDataFieldProps {
    translate: (key: string, params?: Record<string, any>) => string;
    demandesVisitesData?: Record<string, any>;
}
export const DemandeVisiteEditDataFields: React.FC<VisiteDataFieldProps> = ({ translate, demandesVisitesData }) => {
    const bienImmobilier = demandesVisitesData?.bienImmobilier;
    const proprietaire = demandesVisitesData?.proprietaire;
    const client = demandesVisitesData?.createdByModel;

    return (
        <Space direction="vertical" style={{width: "100%"}} size="large">
            <Card
                title={
                    <Space>
                        <DatabaseOutlined />
                        <p>{translate("demandes_visites.fields.data")}</p>
                    </Space>
                }
                headStyle={{ padding: "1rem", border:"0.5px solid black" }}
                bodyStyle={{ padding: "2rem", border:"0.5px solid black",  display: "flex" , flexDirection:"row" }}
            >
                <Card style={{ border: "none", width: "50%", display: "flex" , flexDirection:"row"}}>
                    <ReadOnlyFormField
                        label={translate("demandes_visites.fields.client_phone_number")}
                        content={demandesVisitesData?.clientPhoneNumber}
                    />
                    <ReadOnlyFormField
                        label={translate("demandes_visites.fields.notes")}
                        content={demandesVisitesData?.notes}
                    />
                    <ReadOnlyFormField
                        label={translate("demandes_visites.fields.retrait_pro_effectue")}
                        content={demandesVisitesData?.retraitProEffectue ? "Oui" : "Non"}
                    />
                </Card>

                <Card style={{ width: "50%", border: "none" }}>
                    <ReadOnlyFormField
                        label={translate("demandes_visites.fields.montant_total_demande_visite")}
                        content={demandesVisitesData?.montantTotalDemandeVisite}
                    />
                    <ReadOnlyFormField
                        label={translate("demandes_visites.fields.montant_demande_visite_sans_commission")}
                        content={demandesVisitesData?.montantDemandeVisiteSansCommission}
                    />
                    <ReadOnlyFormField
                        label={translate("demandes_visites.fields.created_at")}
                        content={new Date(demandesVisitesData?.createdAt).toLocaleDateString()}
                    />
                </Card>
            </Card>

            {/* Informations du bien */}
            <Card
                title={
                    <Space>
                        <HomeOutlined/>
                        <p>{translate("Bien immobilier")}</p>
                    </Space>
                }
                extra={
                    bienImmobilier?.id && (
                        <Link to={`/biens-immobiliers/edit/${bienImmobilier.id}`}>
                            <Button type="link" icon={<ArrowRightOutlined />}>
                                {translate("actions.details")}
                            </Button>
                        </Link>
                    )
                }
                headStyle={{ padding: "1rem", border:"0.5px solid black"}}
                bodyStyle={{ padding: "2rem", border:"0.5px solid black", display:"flex", flexDirection: "row" }}
            >
                <Card style={{border: "none", width: "50%"}}>
                    <ReadOnlyFormField label={translate("fields.nom")} content={bienImmobilier?.nom}/>
                    <ReadOnlyFormField label={translate("biens_immobiliers.fields.type_bien_immobilier")} content={bienImmobilier?.typeBienImmobilier}/>
                    <ReadOnlyFormField label={translate("fields.adresse")} content={bienImmobilier?.adresse}/>
                </Card>
                <Card style={{border: "none", width: "50%"}}>
                    <ReadOnlyFormField label={translate("biens_immobiliers.fields.prix")} content={bienImmobilier?.prix}/>
                    <ReadOnlyFormField label={translate("fields.description")} content={bienImmobilier?.description}/>
                    <ReadOnlyFormField label={translate("biens_immobiliers.fields.nombre_max_occupants")} content={bienImmobilier?.nombreMaxOccupants}/>
                </Card>
            </Card>

            {/* Informations du propriétaire */}
            <Card
                title={
                    <Space>
                        <UserOutlined/>
                        <p>{translate("Propriétaire")}</p>
                    </Space>
                }
                extra={
                    proprietaire?.id && (
                        <Link to={`/users/edit/${proprietaire.id}`}>
                            <Button type="link" icon={<ArrowRightOutlined />}>
                                {translate("actions.details")}
                            </Button>
                        </Link>
                    )
                }
                headStyle={{ padding: "1rem", border:"0.5px solid black"}}
                bodyStyle={{ padding: "2rem", border:"0.5px solid black", display:"flex", flexDirection: "row" }}
            >
                <Card style={{border: "none", width: "50%"}}>
                    <ReadOnlyFormField label={translate("fields.full_name")} content={`${proprietaire?.firstName || ''} ${proprietaire?.lastName || ''}`}/>
                    <ReadOnlyFormField label={translate("fields.email")} content={proprietaire?.email}/>
                </Card>
                <Card style={{border: "none", width: "50%"}}>
                    <ReadOnlyFormField label={translate("fields.phone_number")} content={proprietaire?.phoneNumber}/>
                    <ReadOnlyFormField label={translate("fields.adresse")} content={proprietaire?.address}/>
                </Card>
            </Card>

            {/* Informations du client */}
            <Card
                title={
                    <Space>
                        <TeamOutlined/>
                        <p>{translate("fields.client")}</p>
                    </Space>
                }
                extra={
                    client?.id && (
                        <Link to={`/users/edit/${client.id}`}>
                            <Button type="link" icon={<ArrowRightOutlined />}>
                                {translate("actions.details")}
                            </Button>
                        </Link>
                    )
                }
                headStyle={{ padding: "1rem", border:"0.5px solid black"}}
                bodyStyle={{ padding: "2rem", border:"0.5px solid black", display:"flex", flexDirection: "row" }}
            >
                <Card style={{border: "none", width: "50%"}}>
                    <ReadOnlyFormField label={translate("fields.full_name")} content={`${client?.firstName || ''} ${client?.lastName || ''}`}/>
                    <ReadOnlyFormField label={translate("fields.email")} content={client?.email}/>
                </Card>
                <Card style={{border: "none", width: "50%"}}>
                    <ReadOnlyFormField label={translate("fields.phone_number")} content={client?.phoneNumber}/>
                </Card>
            </Card>
        </Space>
    );
};
