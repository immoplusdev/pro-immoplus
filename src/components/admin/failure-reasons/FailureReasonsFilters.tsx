import { useState } from "react";
import { Button, DatePicker, Select, Space } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { ACTOR_TAGS, FAILURE_ACTORS, type FailureActor, type FailureStatus } from "@/types/failure-reasons.types";
import {
  API_DATE_FORMAT,
  applyActorChange,
  applyReasonChange,
  applyStatusChange,
  reasonOptionsFor,
  selectedReasonOption,
  statusOptionsFor,
  type FailureFilterValues,
} from "@/lib/helpers/failure-reasons.helper";

const { RangePicker } = DatePicker;
const ACTOR_ALL = "ALL";

interface Props {
  /** Filtres appliqués (issus de l'URL, déjà assainis). */
  value: FailureFilterValues;
  onSearch: (value: FailureFilterValues) => void;
  onReset: () => void;
}

function toRange(v: FailureFilterValues): [Dayjs, Dayjs] | null {
  return v.dateDebut && v.dateFin ? [dayjs(v.dateDebut, API_DATE_FORMAT), dayjs(v.dateFin, API_DATE_FORMAT)] : null;
}

/**
 * Filtres dépendants (acteur → statuts / motifs). Édition locale, appliquée au clic sur "Rechercher".
 * Le parent remonte ce composant (`key`) quand les filtres appliqués changent.
 */
export function FailureReasonsFilters({ value, onSearch, onReset }: Props) {
  const [draft, setDraft] = useState<FailureFilterValues>(value);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(() => toRange(value));

  // Dates formatées en local (pas de conversion UTC qui décalerait d'un jour).
  const submit = () =>
    onSearch({
      ...draft,
      dateDebut: range?.[0].format(API_DATE_FORMAT),
      dateFin: range?.[1].format(API_DATE_FORMAT),
    });

  return (
    <Space wrap style={{ marginBottom: 16 }} role="search" aria-label="Filtres des motifs d'échec">
      <RangePicker
        aria-label="Période de réponse"
        format="DD/MM/YYYY"
        value={range}
        disabledDate={(d) => d.isAfter(dayjs(), "day")}
        onChange={(v) => setRange(v && v[0] && v[1] ? [v[0], v[1]] : null)}
      />
      <Select<FailureActor | typeof ACTOR_ALL>
        aria-label="Acteur"
        style={{ width: 120 }}
        value={draft.actor ?? ACTOR_ALL}
        onChange={(v) => setDraft((d) => applyActorChange(d, v === ACTOR_ALL ? undefined : v))}
        options={[
          { value: ACTOR_ALL, label: "Tous" },
          ...FAILURE_ACTORS.map((a) => ({ value: a, label: ACTOR_TAGS[a].label })),
        ]}
      />
      <Select<FailureStatus>
        allowClear
        aria-label="Statut"
        placeholder="Statut"
        style={{ width: 240 }}
        value={draft.status}
        onChange={(v) => setDraft((d) => applyStatusChange(d, v))}
        options={statusOptionsFor(draft.actor)}
      />
      <Select<string>
        allowClear
        showSearch
        optionFilterProp="label"
        aria-label="Motif"
        placeholder="Motif"
        style={{ width: 320 }}
        value={selectedReasonOption(draft)}
        onChange={(v) => setDraft((d) => applyReasonChange(d, v))}
        options={reasonOptionsFor(draft.actor)}
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
