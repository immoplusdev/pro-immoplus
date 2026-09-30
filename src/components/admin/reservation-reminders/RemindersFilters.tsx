import { Button, Col, DatePicker, Row, Select } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import dayjs, { type Dayjs } from "dayjs";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";
import { API_DATE_FORMAT, type ReminderFilterValues } from "@/lib/helpers/reservation-reminders.helper";
import {
  REMINDER_KIND_LABELS,
  REMINDER_KINDS,
  REMINDER_TRIGGER_TAGS,
  REMINDER_TRIGGERS,
  type ReminderKind,
  type ReminderTrigger,
} from "@/types/reservation-reminders.types";

const { RangePicker } = DatePicker;

interface Props {
  /** Filtres appliqués (issus de l'URL, déjà assainis). */
  value: ReminderFilterValues;
  onChange: (patch: Partial<ReminderFilterValues>) => void;
  onReset: () => void;
}

const KIND_OPTIONS = REMINDER_KINDS.map((k) => ({ value: k, label: REMINDER_KIND_LABELS[k] }));
const TRIGGER_OPTIONS = REMINDER_TRIGGERS.map((t) => ({ value: t, label: REMINDER_TRIGGER_TAGS[t].label }));

/** Filtres de la liste des relances, appliqués dès la sélection (l'URL est la source de vérité). */
export function RemindersFilters({ value, onChange, onReset }: Props) {
  const translate = useTranslate();

  const statusOptions = Object.values(StatusReservation).map((s) => ({
    value: s,
    label: translate(`reservations.status_reservation.${s}`, s),
  }));

  const range: [Dayjs, Dayjs] | null =
    value.dateFrom && value.dateTo
      ? [dayjs(value.dateFrom, API_DATE_FORMAT), dayjs(value.dateTo, API_DATE_FORMAT)]
      : null;

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }} role="search" aria-label="Filtres des relances">
      <Col xs={24} sm={12} lg={6}>
        <Select<ReminderKind>
          allowClear
          aria-label="Type de relance"
          placeholder="Type"
          style={{ width: "100%" }}
          value={value.kind}
          onChange={(kind) => onChange({ kind })}
          options={KIND_OPTIONS}
        />
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <Select<ReminderTrigger>
          allowClear
          aria-label="Déclenchement"
          placeholder="Déclenchement"
          style={{ width: "100%" }}
          value={value.trigger}
          onChange={(trigger) => onChange({ trigger })}
          options={TRIGGER_OPTIONS}
        />
      </Col>
      <Col xs={24} sm={12} lg={5}>
        <Select<StatusReservation>
          allowClear
          aria-label="Statut actuel de la réservation"
          placeholder="Statut de la réservation"
          style={{ width: "100%" }}
          value={value.status}
          onChange={(status) => onChange({ status })}
          options={statusOptions}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        {/* Dates formatées sans conversion de fuseau : le jour choisi est le jour envoyé. */}
        <RangePicker
          aria-label="Période d'envoi"
          format="DD/MM/YYYY"
          style={{ width: "100%" }}
          value={range}
          onChange={(v) =>
            onChange(
              v && v[0] && v[1]
                ? { dateFrom: v[0].format(API_DATE_FORMAT), dateTo: v[1].format(API_DATE_FORMAT) }
                : { dateFrom: undefined, dateTo: undefined }
            )
          }
        />
      </Col>
      <Col xs={24} lg={3}>
        <Button icon={<ReloadOutlined />} onClick={onReset} block>
          Réinitialiser
        </Button>
      </Col>
    </Row>
  );
}
