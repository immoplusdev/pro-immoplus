import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Tag, Tooltip } from "antd";
import type { TableProps } from "antd";
import { useClientsList } from "@/hooks/useClientsStatistiques";
import { ClientStatutTag } from "@/components/admin/clients-statistiques/ClientStatutTag";
import { RisqueTag } from "@/components/admin/clients-statistiques/RisqueTag";
import { ScoreBadgeTag } from "@/components/admin/clients-statistiques/ScoreBadgeTag";
import {
  ClientListFilters,
  ClientListItemDto,
  ClientListSortBy,
  formatFcfa,
  segmentLabel,
  SortDirection,
} from "@/types/clients-statistiques.types";

interface Props {
  filters: ClientListFilters;
}

export function ClientsTable({ filters }: Props) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<ClientListSortBy | undefined>(undefined);
  const [sortDir, setSortDir] = useState<SortDirection>(SortDirection.Desc);

  const { data, isFetching } = useClientsList({ ...filters, page, perPage, sortBy, sortDir });

  const rows = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleChange: TableProps<ClientListItemDto>["onChange"] = (pagination, _filters, sorter) => {
    if (pagination.current) setPage(pagination.current);
    if (pagination.pageSize) setPerPage(pagination.pageSize);

    const single = Array.isArray(sorter) ? sorter[0] : sorter;
    if (single?.order && single.columnKey) {
      setSortBy(single.columnKey as ClientListSortBy);
      setSortDir(single.order === "ascend" ? SortDirection.Asc : SortDirection.Desc);
    } else {
      setSortBy(undefined);
    }
  };

  return (
    <Card style={{ border: "1px solid #E8E8E8" }} styles={{ body: { padding: 0 } }}>
      <Table<ClientListItemDto>
        rowKey="clientId"
        loading={isFetching}
        dataSource={rows}
        onChange={handleChange}
        onRow={(record) => ({
          onClick: () => navigate(`/admin/clients-statistiques/${record.clientId}`),
          style: { cursor: "pointer" },
        })}
        pagination={{
          current: page,
          pageSize: perPage,
          total: totalCount,
          showSizeChanger: true,
        }}
        scroll={{ x: 1300 }}
        columns={[
          {
            title: "Client",
            key: "client",
            fixed: "left",
            width: 200,
            render: (_, record) => (
              <div>
                <div style={{ fontWeight: 600 }}>{record.nom}</div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>
                  {record.anciennete.joursDepuisInscription} j d'ancienneté
                </div>
              </div>
            ),
          },
          {
            title: "Statut",
            dataIndex: "statut",
            key: "statut",
            width: 100,
            render: (statut: ClientListItemDto["statut"]) => <ClientStatutTag statut={statut} />,
          },
          {
            title: "Score",
            key: ClientListSortBy.ScoreGlobal,
            width: 160,
            sorter: true,
            render: (_, record) => (
              <div>
                <div>{record.score.global}/100</div>
                <ScoreBadgeTag badge={record.score.badge} />
              </div>
            ),
          },
          {
            title: "Risque",
            key: "risque",
            width: 110,
            render: (_, record) => <RisqueTag niveau={record.risque.niveau} />,
          },
          {
            title: "Segment",
            key: "segment",
            width: 110,
            render: (_, record) => <Tag>{segmentLabel[record.fidelite.segment]}</Tag>,
          },
          {
            title: "Taux annulation",
            key: ClientListSortBy.TauxAnnulation,
            width: 130,
            sorter: true,
            render: (_, record) => `${record.reservations.tauxAnnulation.toFixed(1)} %`,
          },
          {
            title: "Note moyenne",
            key: ClientListSortBy.NoteMoyenne,
            width: 120,
            sorter: true,
            render: (_, record) =>
              record.reputation.noteMoyenneHoteClient != null ? `${record.reputation.noteMoyenneHoteClient.toFixed(1)}/5` : "—",
          },
          {
            title: "Montant dépensé",
            key: ClientListSortBy.MontantDepense,
            width: 150,
            sorter: true,
            render: (_, record) => formatFcfa(record.paiements.montantTotalDepenseFcfa),
          },
          {
            title: "Ancienneté",
            key: ClientListSortBy.Anciennete,
            width: 110,
            sorter: true,
            render: (_, record) => `${record.anciennete.joursDepuisInscription} j`,
          },
          {
            title: "Vérification",
            key: "verification",
            width: 130,
            render: (_, record) => (
              <Tooltip
                title={`Identité: ${record.verification.identite ? "OK" : "Non"} · Email: ${
                  record.verification.email ? "OK" : "Non"
                } · Téléphone: ${record.verification.telephone ? "OK" : "Non"}`}
              >
                <span>
                  {[record.verification.identite, record.verification.email, record.verification.telephone].filter(Boolean).length}
                  /3
                </span>
              </Tooltip>
            ),
          },
        ]}
      />
    </Card>
  );
}
