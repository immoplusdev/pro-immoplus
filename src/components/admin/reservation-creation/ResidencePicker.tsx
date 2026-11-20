import { useMemo, useState } from "react";
import { useList, useOne } from "@refinedev/core";
import { Select, Space, Tag, Typography } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { getApiFileUrl } from "@/lib/helpers";
import { formatFcfa } from "@/lib/helpers/admin-reservation-creation.helper";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { AdminReservationResidence } from "@/types/admin-reservation-creation.types";

const { Text } = Typography;

const PAGE_SIZE = 10;

interface ResidenceListRecord {
  id: string;
  nom?: string | null;
  images?: string[] | null;
  prixReservation?: number | null;
  statusValidation?: string | null;
  residenceDisponible?: boolean | number | null;
  ville?: { nom?: string | null } | string | null;
  commune?: { nom?: string | null } | string | null;
}

/** La liste renvoie la relation chargée (`{ nom }`) ou seulement son id : un id n'est pas affiché. */
const placeName = (value: ResidenceListRecord["ville"]): string | null =>
  value && typeof value === "object" ? value.nom ?? null : null;

const toResidence = (record: ResidenceListRecord): AdminReservationResidence => {
  const imageId = record.images?.[0];
  return {
    id: record.id,
    nom: record.nom ?? "Sans nom",
    miniature: imageId ? getApiFileUrl(imageId) : null,
    ville: placeName(record.ville),
    commune: placeName(record.commune),
    prixReservation: record.prixReservation ?? null,
    statusValidation: record.statusValidation ?? null,
    residenceDisponible: record.residenceDisponible == null ? null : !!Number(record.residenceDisponible),
  };
};

function ResidenceOption({ residence }: { residence: AdminReservationResidence }) {
  const place = [residence.ville, residence.commune].filter(Boolean).join(" · ");
  return (
    <Space size={8}>
      <HomeOutlined />
      <span>{residence.nom}</span>
      {place && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {place}
        </Text>
      )}
      {residence.prixReservation != null && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatFcfa(residence.prixReservation)} / nuit
        </Text>
      )}
      {residence.statusValidation && residence.statusValidation !== "valide" && <Tag color="orange">Non validée</Tag>}
      {residence.residenceDisponible === false && <Tag color="red">Indisponible</Tag>}
    </Space>
  );
}

interface Props {
  /** Injectés par `Form.Item`. */
  value?: string | null;
  onChange?: (residence: AdminReservationResidence | null) => void;
  disabled?: boolean;
  status?: "error";
}

/** Recherche d'une résidence par nom (listing des résidences du backoffice). */
export function ResidencePicker({ value, onChange, disabled, status }: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const listQuery = useList<ResidenceListRecord>({
    resource: "residences",
    pagination: { current: 1, pageSize: PAGE_SIZE },
    filters: [{ field: "q", operator: "contains", value: debouncedSearch }],
    queryOptions: { enabled: debouncedSearch.length >= 2, keepPreviousData: true },
  });

  const selectedQuery = useOne<ResidenceListRecord>({
    resource: "residences",
    id: value ?? "",
    queryOptions: { enabled: !!value, staleTime: 5 * 60 * 1000, retry: false },
  });

  const residences = useMemo(() => {
    const byId = new Map<string, AdminReservationResidence>();
    const selected = selectedQuery.data?.data;
    if (value && selected) byId.set(value, toResidence(selected));
    for (const record of listQuery.data?.data ?? []) byId.set(record.id, toResidence(record));
    return byId;
  }, [listQuery.data, selectedQuery.data, value]);

  const options = [...residences.values()].map((residence) => ({
    value: residence.id,
    label: <ResidenceOption residence={residence} />,
  }));

  const notFoundContent =
    search.trim().length < 2
      ? "Tapez au moins 2 caractères du nom"
      : listQuery.isFetching
        ? "Recherche…"
        : listQuery.isError
          ? "Recherche impossible, réessayez"
          : "Aucune résidence trouvée";

  return (
    <Select
      showSearch
      allowClear
      disabled={disabled}
      status={status}
      value={value ?? undefined}
      placeholder="Rechercher une résidence par nom"
      filterOption={false}
      onSearch={setSearch}
      loading={listQuery.isFetching}
      notFoundContent={notFoundContent}
      options={options}
      onChange={(next: string | undefined) =>
        onChange?.(next ? residences.get(next) ?? { id: next, nom: "Résidence", miniature: null } : null)
      }
      style={{ width: "100%" }}
      aria-label="Résidence"
    />
  );
}
