import React from "react";
import {Card, Space} from "antd";
import {DatabaseOutlined} from "@ant-design/icons";
import {ReadOnlyFormField} from "@/lib/ts-utilities";


interface VisiteDataFieldProps {
    translate: (key: string, params?: Record<string, any>) => string;
    demandesVisitesData?: Record<string, any>;
}
export const DemandeVisiteEditDataFields: React.FC<VisiteDataFieldProps> = ({ translate, demandesVisitesData }) => {
    return (
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
    );
};