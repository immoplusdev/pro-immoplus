import { useMemo, useState } from "react";
import { useList, useOne } from "@refinedev/core";
import { Select, Space, Tag, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { UserRole } from "@/core/domain/users";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { clientDisplayName } from "@/lib/helpers/admin-reservation-creation.helper";
import type { AdminReservationClient } from "@/types/admin-reservation-creation.types";

const { Text } = Typography;

const PAGE_SIZE = 10;

function ClientOption({ client }: { client: AdminReservationClient }) {
  const contact = [client.phoneNumber, client.email].filter(Boolean).join(" · ");
  return (
    <Space size={8}>
      <UserOutlined />
      <span>{clientDisplayName(client)}</span>
      {contact && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {contact}
        </Text>
      )}
      {client.status === "Blocked" && <Tag color="red">Bloqué</Tag>}
    </Space>
  );
}

interface Props {
  /** Injectés par `Form.Item`. */
  value?: string | null;
  onChange?: (client: AdminReservationClient | null) => void;
  disabled?: boolean;
  status?: "error";
}

/**
 * Recherche d'un client existant (rôle customer) par nom, téléphone ou email,
 * via le listing des utilisateurs du backoffice (`_search`). On ne crée pas de compte ici.
 */
export function ClientPicker({ value, onChange, disabled, status }: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const listQuery = useList<AdminReservationClient>({
    resource: "users",
    pagination: { current: 1, pageSize: PAGE_SIZE },
    filters: [
      { field: "role", operator: "eq", value: UserRole.Customer },
      { field: "q", operator: "contains", value: debouncedSearch },
    ],
    queryOptions: { enabled: debouncedSearch.length >= 2, keepPreviousData: true },
  });

  // Client pré-sélectionné (fiche client) ou déjà choisi : affiché même hors des résultats de recherche.
  const selectedQuery = useOne<AdminReservationClient>({
    resource: "users",
    id: value ?? "",
    queryOptions: { enabled: !!value, staleTime: 5 * 60 * 1000, retry: false },
  });

  const clients = useMemo(() => {
    const byId = new Map<string, AdminReservationClient>();
    const selected = selectedQuery.data?.data;
    if (value && selected) byId.set(value, selected);
    for (const client of listQuery.data?.data ?? []) byId.set(client.id, client);
    return byId;
  }, [listQuery.data, selectedQuery.data, value]);

  const options = [...clients.values()].map((client) => ({
    value: client.id,
    label: <ClientOption client={client} />,
  }));

  const notFoundContent =
    search.trim().length < 2
      ? "Tapez au moins 2 caractères (nom, téléphone ou email)"
      : listQuery.isFetching
        ? "Recherche…"
        : listQuery.isError
          ? "Recherche impossible, réessayez"
          : "Aucun client trouvé";

  return (
    <Select
      showSearch
      allowClear
      disabled={disabled}
      status={status}
      value={value ?? undefined}
      placeholder="Rechercher un client par nom, téléphone ou email"
      filterOption={false}
      onSearch={setSearch}
      loading={listQuery.isFetching || (!!value && selectedQuery.isFetching)}
      notFoundContent={notFoundContent}
      options={options}
      onChange={(next: string | undefined) => onChange?.(next ? clients.get(next) ?? { id: next } : null)}
      style={{ width: "100%" }}
      aria-label="Client"
    />
  );
}
