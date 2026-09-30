import { useState } from "react";
import { Button, DatePicker, Input, Select, Space } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { LOCATION_ROLES, locationRoleMap, type LocationRole } from "@/types/location.types";
import { API_DATE_FORMAT } from "./format";

const { RangePicker } = DatePicker;

export interface LocationExportFilterValues {
  from?: string;
  to?: string;
  role?: LocationRole;
  city?: string;
}

interface Props {
  /** Filtres appliqués (issus de l'URL). */
  value: LocationExportFilterValues;
  onSearch: (value: LocationExportFilterValues) => void;
  onReset: () => void;
}

const ROLE_ALL = "ALL";

function toRange(from?: string, to?: string): [Dayjs, Dayjs] | null {
  return from && to ? [dayjs(from, API_DATE_FORMAT), dayjs(to, API_DATE_FORMAT)] : null;
}

/**
 * Barre de filtres : l'édition est locale (brouillon), appliquée à l'URL au clic sur "Rechercher".
 * Le parent remonte ce composant (`key`) quand les filtres appliqués changent, pour resynchroniser le brouillon.
 */
export function LocationExportFilters({ value, onSearch, onReset }: Props) {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(() => toRange(value.from, value.to));
  const [role, setRole] = useState<LocationRole | typeof ROLE_ALL>(value.role ?? ROLE_ALL);
  const [city, setCity] = useState(value.city ?? "");

  // city : égalité exacte côté back → trim début/fin ; role "Tous" → non envoyé.
  const submit = () =>
    onSearch({
      from: range?.[0].format(API_DATE_FORMAT),
      to: range?.[1].format(API_DATE_FORMAT),
      role: role === ROLE_ALL ? undefined : role,
      city: city.trim() || undefined,
    });

  return (
    <Space wrap style={{ marginBottom: 16 }} role="search" aria-label="Filtres des positions">
      <RangePicker
        aria-label="Période"
        format="DD/MM/YYYY"
        value={range}
        disabledDate={(d) => d.isAfter(dayjs(), "day")}
        onChange={(v) => setRange(v && v[0] && v[1] ? [v[0], v[1]] : null)}
      />
      <Select<LocationRole | typeof ROLE_ALL>
        aria-label="Rôle"
        style={{ width: 140 }}
        value={role}
        onChange={setRole}
        options={[
          { value: ROLE_ALL, label: "Tous" },
          ...LOCATION_ROLES.map((r) => ({ value: r, label: locationRoleMap[r].label })),
        ]}
      />
      <Input
        allowClear
        aria-label="Ville (nom exact)"
        placeholder="Nom exact, ex. Abidjan"
        style={{ width: 220 }}
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onPressEnter={submit}
      />
      <Button type="primary" icon={<SearchOutlined />} onClick={submit}>
        Rechercher
      </Button>
      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Réinitialiser
      </Button>
    </Space>
  );
}
