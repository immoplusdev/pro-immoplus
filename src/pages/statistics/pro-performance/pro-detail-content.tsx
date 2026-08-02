import React from "react";
import { Tag, Descriptions, Typography, Divider } from "antd";
import dayjs from "dayjs";
import { ProPerformanceRow, formatFcfa, badgeTagColor, badgeLabel } from "./types";

interface Props {
    pro: ProPerformanceRow;
}

export function ProDetailContent({ pro }: Props) {
    return (
        <>
            <Tag color={badgeTagColor[pro.qualite.badge]}>{badgeLabel[pro.qualite.badge]}</Tag>
            <Typography.Text style={{ marginLeft: 8 }}>Score : {pro.qualite.score}/100</Typography.Text>

            <Divider orientation="left" plain>Réponse</Divider>
            <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Reçues">{pro.reponse.recues}</Descriptions.Item>
                <Descriptions.Item label="Acceptées">{pro.reponse.acceptees}</Descriptions.Item>
                <Descriptions.Item label="Refusées">{pro.reponse.refusees}</Descriptions.Item>
                <Descriptions.Item label="Sans réponse">{pro.reponse.sansReponse}</Descriptions.Item>
                <Descriptions.Item label="Taux acceptation">{pro.reponse.tauxAcceptation.toFixed(1)} %</Descriptions.Item>
                <Descriptions.Item label="Délai médian">
                    {pro.reponse.delaiMedianMinutes != null ? `${pro.reponse.delaiMedianMinutes} min` : "—"}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" plain>Conversion</Divider>
            <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Confirmées">{pro.conversion.confirmees}</Descriptions.Item>
                <Descriptions.Item label="Effectuées">{pro.conversion.effectuees}</Descriptions.Item>
                <Descriptions.Item label="Annul. client">{pro.conversion.annulationsClient}</Descriptions.Item>
                <Descriptions.Item label="Annul. Pro">{pro.conversion.annulationsPro}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" plain>Valeur</Divider>
            <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="CA brut">{formatFcfa(pro.valeur.caBrutFcfa)}</Descriptions.Item>
                <Descriptions.Item label="CA validé">{formatFcfa(pro.valeur.caValideFcfa)}</Descriptions.Item>
                <Descriptions.Item label="Remboursements">{formatFcfa(pro.valeur.remboursementsFcfa)}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" plain>Qualité</Divider>
            <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Alertes">
                    {pro.qualite.alertes.length > 0 ? pro.qualite.alertes.join(", ") : "Aucune"}
                </Descriptions.Item>
                <Descriptions.Item label="Dernière activité">
                    {pro.qualite.derniereActiviteAt
                        ? dayjs(pro.qualite.derniereActiviteAt).format("DD/MM/YYYY HH:mm")
                        : "—"}
                </Descriptions.Item>
            </Descriptions>
        </>
    );
}
