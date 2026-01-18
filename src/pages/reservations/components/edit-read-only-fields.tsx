import {Card, Col, Form, Input, Row, Space, Button} from "antd";
import {DatabaseOutlined, HomeOutlined, UserOutlined, TeamOutlined, ArrowRightOutlined} from "@ant-design/icons";
import React from "react";
import {BaseRecord} from "@refinedev/core";
import {ReadOnlyFormField} from "@/lib/ts-utilities";
import {Link} from "react-router-dom";


type TranslateFunction = (key: string, params?: Record<string, any>) => string;
interface ReadOnlySectionProps {
    translate: TranslateFunction;
    reservationData?: BaseRecord;
}

export const ReservationEditDataFields: React.FC<ReadOnlySectionProps> = ({translate, reservationData}) => {
    const residence = reservationData?.residence;
    const proprietaire = reservationData?.proprietaire;
    const client = reservationData?.client;

    return (
        <Space direction="vertical" style={{width: "100%"}} size="large">
            {/* Données de la réservation */}
            <Card
                title={
                    <Space>
                        <DatabaseOutlined/>
                        <p>{translate("reservations.fields.data")}</p>
                    </Space>
                }
                headStyle={{ padding: "1rem", border:"0.5px solid black"}}
                bodyStyle={{ padding: "2rem", border:"0.5px solid black", display:"flex", flexDirection: "row" }}
            >
                <Card style={{border: "none", width: "50%"}}>
                    <ReadOnlyFormField label={translate("fields.notes")} content={reservationData?.notes}/>
                    <ReadOnlyFormField label={translate("reservations.fields.retrait_pro_effectue")} content={reservationData?.retraitProEffectue ? "Oui" : "Non"}/>
                    <ReadOnlyFormField label={translate("reservations.fields.montant_total_reservation")} content={reservationData?.montantTotalReservation}/>
                    <ReadOnlyFormField label={translate("reservations.fields.montant_reservation_sans_commission")} content={reservationData?.montantReservationSansCommission}/>
                </Card>
                <Card style={{border: "none", width: "50%"}}>
                    <ReadOnlyFormField label={translate("fields.client_phone_number")} content={reservationData?.clientPhoneNumber}/>
                    <ReadOnlyFormField label={translate("fields.created_at")} content={new Date(reservationData?.createdAt).toLocaleDateString()}/>
                    <ReadOnlyFormField label={translate("fields.updated_at")} content={new Date(reservationData?.updatedAt).toLocaleDateString()}/>
                </Card>
            </Card>

            {/* Informations de la résidence */}
            <Card
                title={
                    <Space>
                        <HomeOutlined/>
                        <p>{translate("residences.residence")}</p>
                    </Space>
                }
                extra={
                    residence?.id && (
                        <Link to={`/residences/edit/${residence.id}`}>
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
                    <ReadOnlyFormField label={translate("fields.nom")} content={residence?.nom}/>
                    <ReadOnlyFormField label={translate("residences.fields.type_residence")} content={residence?.typeResidence}/>
                    <ReadOnlyFormField label={translate("fields.adresse")} content={residence?.adresse}/>
                </Card>
                <Card style={{border: "none", width: "50%"}}>
                    <ReadOnlyFormField label={translate("fields.prix_reservation")} content={residence?.prixReservation}/>
                    <ReadOnlyFormField label={translate("residences.fields.nombre_max_occupants")} content={residence?.nombreMaxOccupants}/>
                    <ReadOnlyFormField label={translate("fields.description")} content={residence?.description}/>
                </Card>
            </Card>

            {/* Informations du propriétaire */}
            <Card
                title={
                    <Space>
                        <UserOutlined/>
                        <p>{translate("reservations.fields.proprietaire")}</p>
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
                    <ReadOnlyFormField label={translate("fields.adresse")} content={client?.address}/>
                </Card>
            </Card>
        </Space>
    )
}