import React from "react";
import { Descriptions, Divider, Rate, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { ClientStatutTag } from "@/components/admin/clients-statistiques/ClientStatutTag";
import { RisqueTag } from "@/components/admin/clients-statistiques/RisqueTag";
import { ScoreBadgeTag } from "@/components/admin/clients-statistiques/ScoreBadgeTag";
import { ClientDetailDto, formatFcfa, segmentLabel } from "@/types/clients-statistiques.types";

const { Text } = Typography;

interface Props {
  client: ClientDetailDto;
}

export function ClientDetailContent({ client }: Props) {
  return (
    <>
      <Divider orientation="left" plain>
        Identité
      </Divider>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Statut">
          <ClientStatutTag statut={client.statut} />
        </Descriptions.Item>
        <Descriptions.Item label="Segment">{segmentLabel[client.fidelite.segment]}</Descriptions.Item>
        <Descriptions.Item label="Inscrit le">{dayjs(client.anciennete.createdAt).format("DD/MM/YYYY")}</Descriptions.Item>
        <Descriptions.Item label="Ancienneté">{client.anciennete.joursDepuisInscription} jours</Descriptions.Item>
        <Descriptions.Item label="Identité vérifiée">{client.verification.identite ? "Oui" : "Non"}</Descriptions.Item>
        <Descriptions.Item label="Email vérifié">{client.verification.email ? "Oui" : "Non"}</Descriptions.Item>
        <Descriptions.Item label="Téléphone vérifié">{client.verification.telephone ? "Oui" : "Non"}</Descriptions.Item>
        <Descriptions.Item label="Client récurrent">{client.fidelite.clientRecurrent ? "Oui" : "Non"}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" plain>
        Score &amp; risque
      </Divider>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Score global">{client.score.global}/100</Descriptions.Item>
        <Descriptions.Item label="Badge">
          {client.score.badge ? <ScoreBadgeTag badge={client.score.badge} /> : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Niveau de risque">
          <RisqueTag niveau={client.risque.niveau} />
        </Descriptions.Item>
        <Descriptions.Item label="Raisons du risque" span={1}>
          {client.risque.raisons.length > 0 ? client.risque.raisons.join(", ") : "Aucune"}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" plain>
        Réservations
      </Divider>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Total">{client.reservations.total}</Descriptions.Item>
        <Descriptions.Item label="Terminées">{client.reservations.terminees}</Descriptions.Item>
        <Descriptions.Item label="Annulées (client)">{client.reservations.annuleesClient}</Descriptions.Item>
        <Descriptions.Item label="Sans réponse">{client.reservations.sansReponse}</Descriptions.Item>
        <Descriptions.Item label="Taux d'annulation">{client.reservations.tauxAnnulation.toFixed(1)} %</Descriptions.Item>
        <Descriptions.Item label="Taux échec paiement">{client.paiements.tauxEchec.toFixed(1)} %</Descriptions.Item>
        <Descriptions.Item label="Montant dépensé" span={2}>
          {formatFcfa(client.paiements.montantTotalDepenseFcfa)}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" plain>
        Réputation
      </Divider>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Note moyenne (hôte → client)">
          {client.reputation.noteMoyenneHoteClient != null ? (
            <>
              <Rate disabled allowHalf value={client.reputation.noteMoyenneHoteClient} style={{ fontSize: 14 }} />{" "}
              {client.reputation.noteMoyenneHoteClient.toFixed(1)}/5
            </>
          ) : (
            "—"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Comportement">
          {client.reputation.comportement ? <Tag>{client.reputation.comportement}</Tag> : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Taux de recommandation" span={2}>
          {client.reputation.tauxRecommandation.toFixed(1)} %
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" plain>
        Historique des réservations
      </Divider>
      <Table
        size="small"
        rowKey="reservationId"
        dataSource={client.historique.dernieresReservations}
        pagination={false}
        columns={[
          { title: "Réservation", dataIndex: "reservationId", key: "reservationId" },
          { title: "Statut", dataIndex: "statut", key: "statut" },
          {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (value: string) => dayjs(value).format("DD/MM/YYYY"),
          },
          {
            title: "Montant",
            dataIndex: "montantFcfa",
            key: "montantFcfa",
            render: (value: number) => formatFcfa(value),
          },
        ]}
        locale={{ emptyText: "Aucune réservation" }}
      />

      <Divider orientation="left" plain>
        Derniers avis hôtes
      </Divider>
      <Table
        size="small"
        rowKey="reservationId"
        dataSource={client.historique.derniersAvisHote}
        pagination={false}
        columns={[
          { title: "Réservation", dataIndex: "reservationId", key: "reservationId" },
          {
            title: "Note",
            dataIndex: "note",
            key: "note",
            render: (value: number | null) => (value != null ? `${value}/5` : "—"),
          },
          {
            title: "Comportement",
            dataIndex: "comportement",
            key: "comportement",
            render: (value: string | null) => value ?? "—",
          },
          {
            title: "Commentaire",
            dataIndex: "commentaire",
            key: "commentaire",
            render: (value: string | null) => value ?? <Text type="secondary">—</Text>,
          },
        ]}
        locale={{ emptyText: "Aucun avis" }}
      />
    </>
  );
}
