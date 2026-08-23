import React from "react";
import { Card, Col, Progress, Row, Space, Spin, Statistic, Tooltip, Typography } from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
  WarningOutlined,
  HomeOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  StarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useClientsKpis } from "@/hooks/useClientsStatistiques";
import { ClientKpiFilters, formatFcfa, formatPercent } from "@/types/clients-statistiques.types";

const { Text } = Typography;

interface Props {
  filters: ClientKpiFilters;
}

export function ClientsKpis({ filters }: Props) {
  const { data: kpis, isFetching } = useClientsKpis(filters);

  if (isFetching && !kpis) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  const stats = [
    {
      title: "Total clients",
      value: kpis?.totalClients ?? 0,
      icon: <TeamOutlined style={{ fontSize: 22, color: "#2744DE" }} />,
      bgIcon: "#EEF1FE",
    },
    {
      title: "Nouveaux clients",
      value: kpis?.nouveauxClients ?? 0,
      icon: <UserAddOutlined style={{ fontSize: 22, color: "#1F8A5B" }} />,
      bgIcon: "#E8F4EE",
    },
    {
      title: "Clients actifs",
      value: kpis?.clientsActifs ?? 0,
      icon: <UserOutlined style={{ fontSize: 22, color: "#7B8DFF" }} />,
      bgIcon: "#E8EBFF",
    },
    {
      title: "Clients à risque",
      value: kpis?.alertes.clientsARisque ?? 0,
      icon: <WarningOutlined style={{ fontSize: 22, color: "#C13838" }} />,
      bgIcon: "#FBE9E9",
    },
    {
      title: "Réservations effectuées",
      value: kpis?.reservations.totalEffectuees ?? 0,
      icon: <HomeOutlined style={{ fontSize: 22, color: "#FA9F42" }} />,
      bgIcon: "#FDE8D3",
    },
    {
      title: "Taux annulation client",
      value: kpis ? formatPercent(kpis.reservations.tauxAnnulationClient) : "—",
      isText: true,
      icon: <CloseCircleOutlined style={{ fontSize: 22, color: "#C13838" }} />,
      bgIcon: "#FBE9E9",
    },
    {
      title: "Taux sans réponse",
      value: kpis ? formatPercent(kpis.reservations.tauxSansReponse) : "—",
      isText: true,
      icon: <ClockCircleOutlined style={{ fontSize: 22, color: "#B86B0A" }} />,
      bgIcon: "#FCEFDD",
    },
    {
      title: "Taux échec paiement",
      value: kpis ? formatPercent(kpis.paiements.tauxEchec) : "—",
      isText: true,
      icon: <CloseCircleOutlined style={{ fontSize: 22, color: "#B86B0A" }} />,
      bgIcon: "#FCEFDD",
    },
    {
      title: "Montant dépensé",
      value: kpis ? formatFcfa(kpis.paiements.montantTotalDepenseFcfa) : "0 FCFA",
      isText: true,
      icon: <DollarOutlined style={{ fontSize: 22, color: "#1F8A5B" }} />,
      bgIcon: "#E8F4EE",
    },
    {
      title: "Note moyenne (hôte → client)",
      value: kpis?.reputation.noteMoyenneHoteClient ?? "—",
      suffix: kpis?.reputation.noteMoyenneHoteClient != null ? "/5" : undefined,
      icon: <StarOutlined style={{ fontSize: 22, color: "#d4a017" }} />,
      bgIcon: "#FBF3DA",
    },
    {
      title: "Taux de recommandation",
      value: kpis?.reputation.tauxRecommandation ?? 0,
      suffix: "%",
      icon: <StarOutlined style={{ fontSize: 22, color: "#2744DE" }} />,
      bgIcon: "#EEF1FE",
    },
  ];

  const repartition = kpis?.reputation.repartitionComportement;
  const repartitionTotal = repartition ? repartition.respectueux + repartition.acceptable + repartition.problematique : 0;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space size={6}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Score calculé quotidiennement (cron 2h du matin), peut avoir jusqu'à 24h de décalage sauf recalcul manuel
          forcé sur la fiche client.
        </Text>
        <Tooltip title="Les données de score/risque/segment proviennent d'une table recalculée chaque nuit.">
          <InfoCircleOutlined style={{ color: "rgba(0,0,0,0.45)" }} />
        </Tooltip>
      </Space>

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col key={stat.title} xs={24} sm={12} lg={8} xl={6}>
            <Card
              style={{ background: "#FFFFFF", border: "1px solid #E8E8E8", boxShadow: "none" }}
              styles={{ body: { display: "flex", alignItems: "center", gap: 16 } }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: stat.bgIcon,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              {stat.isText ? (
                <div>
                  <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>{stat.title}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</div>
                </div>
              ) : (
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  suffix={stat.suffix}
                  valueStyle={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {repartition && (
        <Card title="Répartition du comportement" style={{ border: "1px solid #E8E8E8" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Text style={{ fontSize: 13 }}>Respectueux ({repartition.respectueux})</Text>
              <Progress
                percent={repartitionTotal ? Math.round((repartition.respectueux / repartitionTotal) * 100) : 0}
                strokeColor="#1F8A5B"
              />
            </Col>
            <Col xs={24} md={8}>
              <Text style={{ fontSize: 13 }}>Acceptable ({repartition.acceptable})</Text>
              <Progress
                percent={repartitionTotal ? Math.round((repartition.acceptable / repartitionTotal) * 100) : 0}
                strokeColor="#B86B0A"
              />
            </Col>
            <Col xs={24} md={8}>
              <Text style={{ fontSize: 13 }}>Problématique ({repartition.problematique})</Text>
              <Progress
                percent={repartitionTotal ? Math.round((repartition.problematique / repartitionTotal) * 100) : 0}
                strokeColor="#C13838"
              />
            </Col>
          </Row>
        </Card>
      )}
    </Space>
  );
}
