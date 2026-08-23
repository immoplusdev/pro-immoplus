import React, { useState } from "react";
import { Card, Select, Space, Table, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { useSignalements } from "@/hooks/useClientsStatistiques";
import { SignalementGraviteTag, SignalementStatutTag } from "@/components/admin/clients-statistiques/SignalementTags";
import {
  AdminSignalementItemDto,
  signalementCategorieLabel,
  SignalementStatut,
  signalementStatutOptions,
} from "@/types/clients-statistiques.types";

const { Text } = Typography;

interface Props {
  clientId?: string;
}

export function SignalementsTable({ clientId }: Props) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [statut, setStatut] = useState<SignalementStatut | undefined>(undefined);

  const { data, isFetching } = useSignalements({ clientId, statut, page, perPage });

  const rows = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <Card style={{ border: "1px solid #E8E8E8" }} styles={{ body: { padding: 0 } }}>
      <div style={{ padding: 16 }}>
        <Space>
          <Select
            allowClear
            placeholder="Statut"
            style={{ width: 160 }}
            options={signalementStatutOptions}
            value={statut}
            onChange={(value) => {
              setStatut(value);
              setPage(1);
            }}
          />
        </Space>
      </div>
      <Table<AdminSignalementItemDto>
        rowKey="signalementId"
        loading={isFetching}
        dataSource={rows}
        pagination={{
          current: page,
          pageSize: perPage,
          total: totalCount,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPerPage(ps);
          },
        }}
        columns={[
          {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 140,
            render: (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm"),
          },
          {
            title: "Catégorie",
            dataIndex: "categorie",
            key: "categorie",
            width: 130,
            render: (categorie: AdminSignalementItemDto["categorie"]) => signalementCategorieLabel[categorie],
          },
          {
            title: "Gravité",
            dataIndex: "gravite",
            key: "gravite",
            width: 100,
            render: (gravite: AdminSignalementItemDto["gravite"]) => <SignalementGraviteTag gravite={gravite} />,
          },
          {
            title: "Statut",
            dataIndex: "statut",
            key: "statut",
            width: 120,
            render: (statutValue: AdminSignalementItemDto["statut"]) => <SignalementStatutTag statut={statutValue} />,
          },
          {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (value: string) => (
              <Tooltip title={value}>
                <Text ellipsis style={{ maxWidth: 300, display: "inline-block" }}>
                  {value}
                </Text>
              </Tooltip>
            ),
          },
          {
            title: "Traité le",
            dataIndex: "traiteLe",
            key: "traiteLe",
            width: 140,
            render: (value: string | null) => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—"),
          },
        ]}
      />
    </Card>
  );
}
