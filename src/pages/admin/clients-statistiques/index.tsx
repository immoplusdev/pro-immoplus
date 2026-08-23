import React, { useState } from "react";
import { Tabs, Typography } from "antd";
import { ClientsKpiFiltersBar } from "./clients-kpi-filters";
import { ClientsKpis } from "./clients-kpis";
import { ClientsFiltersBar } from "./clients-filters";
import { ClientsTable } from "./clients-table";
import { SignalementsTable } from "./signalements-table";
import { ClientKpiFilters, ClientKpiPeriod, ClientListFilters } from "@/types/clients-statistiques.types";

const { Title } = Typography;

export function ClientsStatistiquesList() {
  const [kpiFilters, setKpiFilters] = useState<ClientKpiFilters>({ period: ClientKpiPeriod.Month });
  const [listFilters, setListFilters] = useState<ClientListFilters>({});

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Title level={3} style={{ margin: 0, marginBottom: 16 }}>
        Statistiques Clients
      </Title>
      <Tabs
        items={[
          {
            key: "classement",
            label: "Classement",
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ClientsKpiFiltersBar filters={kpiFilters} onChange={setKpiFilters} />
                <ClientsKpis filters={kpiFilters} />
                <ClientsFiltersBar filters={listFilters} onChange={setListFilters} />
                <ClientsTable filters={listFilters} />
              </div>
            ),
          },
          {
            key: "signalements",
            label: "Signalements",
            children: <SignalementsTable />,
          },
        ]}
      />
    </div>
  );
}
