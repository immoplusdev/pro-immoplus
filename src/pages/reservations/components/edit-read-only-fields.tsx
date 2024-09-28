import {Card, Col, Form, Input, Row, Space} from "antd";
import {DatabaseOutlined} from "@ant-design/icons";
import React from "react";
import {BaseRecord} from "@refinedev/core";
import {ReadOnlyFormField} from "@/lib/ts-utilities";


type TranslateFunction = (key: string, params?: Record<string, any>) => string;
interface ReadOnlySectionProps {
    translate: TranslateFunction;
    reservationData?: BaseRecord;
}

export const ReservationEditDataFields: React.FC<ReadOnlySectionProps> = ({translate, reservationData}) => {
    return (
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
                <ReadOnlyFormField label={translate("reservations.fields.montant_reservation_sans_commission")} content={reservationData?.montantReservationSansCommission}/>
            </Card>
            <Card style={{border: "none", width: "50%"}}>
                <ReadOnlyFormField label={translate("fields.client_phone_number")} content={reservationData?.clientPhoneNumber}/>
                <ReadOnlyFormField label={translate("fields.created_at")} content={new Date(reservationData?.createdAt).toLocaleDateString()}/>
                <ReadOnlyFormField label={translate("fields.created_at")} content={new Date(reservationData?.createdAt).toLocaleDateString()}/>
                <ReadOnlyFormField label={translate("fields.updated_at")} content={new Date(reservationData?.updatedAt).toLocaleDateString()}/>
            </Card>
        </Card>
    )
}