import { useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Alert, Button, DatePicker, Space, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import {
  addDays,
  findBlockedNights,
  isArrivalDisabled,
  isDepartureDisabled,
  localIsoDay,
  nightsBetween,
  toOccupiedSet,
  type NightCalendarContext,
} from "@/lib/helpers/admin-reservation-creation.helper";
import { extractErrorMessage } from "@/lib/helpers/http-exception.helper";
import { useResidenceOccupiedDates } from "@/hooks/useAdminReservationCreation";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const DAY_FORMAT = "YYYY-MM-DD";

interface Props {
  residenceId: string | null;
  /** Nuits sélectionnées (YYYY-MM-DD), injectées par `Form.Item`. */
  value?: string[];
  onChange?: (nights: string[]) => void;
  disabled?: boolean;
  status?: "error";
}

/**
 * Sélection des nuits : arrivée puis départ. Les nuits passées et déjà prises sont grisées et
 * jamais sélectionnables (même avec « Forcer les règles ») ; le jour du départ peut être occupé.
 */
export function NightsPicker({ residenceId, value: nights = [], onChange: emit, disabled, status }: Props) {
  const onChange = (next: string[]) => emit?.(next);
  const occupiedQuery = useResidenceOccupiedDates(residenceId);
  const context: NightCalendarContext = useMemo(
    () => ({ occupied: toOccupiedSet(occupiedQuery.data?.dates), today: localIsoDay() }),
    [occupiedQuery.data],
  );

  const sorted = useMemo(() => [...nights].sort(), [nights]);
  const value: [Dayjs, Dayjs] | null =
    sorted.length > 0 ? [dayjs(sorted[0]), dayjs(addDays(sorted[sorted.length - 1], 1))] : null;

  // Les dates occupées peuvent changer après la sélection (rechargement) : on le signale.
  const blocked = findBlockedNights(sorted, context);
  // Sans la liste des dates prises, on ne laisse rien sélectionner.
  const datesUnavailable = !!residenceId && (occupiedQuery.isLoading || occupiedQuery.isError);

  const bookingWindow = occupiedQuery.data?.bookingWindow;

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <RangePicker
        format="DD/MM/YYYY"
        placeholder={["Arrivée", "Départ"]}
        disabled={disabled || !residenceId || datesUnavailable}
        status={status}
        value={value}
        allowClear
        style={{ width: "100%" }}
        suffixIcon={<CalendarOutlined />}
        disabledDate={(current, info) => {
          const day = current.format(DAY_FORMAT);
          const from = info?.from;
          return from ? isDepartureDisabled(day, from.format(DAY_FORMAT), context) : isArrivalDisabled(day, context);
        }}
        onChange={(range) => {
          const [start, end] = range ?? [];
          if (!start || !end) return onChange([]);
          onChange(nightsBetween(start.format(DAY_FORMAT), end.format(DAY_FORMAT)));
        }}
      />
      {!residenceId && <Text type="secondary">Choisissez d'abord une résidence.</Text>}
      {residenceId && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Les dates grisées sont passées ou déjà prises : elles ne sont jamais réservables.
          {bookingWindow?.firstBookableNight || bookingWindow?.lastBookableNight
            ? ` Fenêtre habituelle de la résidence : ${bookingWindow.firstBookableNight ?? "…"} → ${bookingWindow.lastBookableNight ?? "…"}.`
            : ""}
        </Text>
      )}
      {sorted.length > 0 && (
        <Text>
          {sorted.length} nuit{sorted.length > 1 ? "s" : ""} : du {dayjs(sorted[0]).format("DD/MM/YYYY")} au{" "}
          {dayjs(addDays(sorted[sorted.length - 1], 1)).format("DD/MM/YYYY")}
        </Text>
      )}
      {occupiedQuery.isError && (
        <Alert
          type="error"
          showIcon
          message="Impossible de charger les dates déjà prises"
          description={extractErrorMessage(occupiedQuery.error, "Une erreur est survenue.")}
          action={
            <Button size="small" onClick={() => occupiedQuery.refetch()}>
              Réessayer
            </Button>
          }
        />
      )}
      {blocked.length > 0 && (
        <Alert
          type="error"
          showIcon
          message="Certaines nuits sélectionnées sont passées ou déjà prises"
          description={blocked.join(", ")}
          action={
            <Button size="small" onClick={() => onChange([])}>
              Effacer
            </Button>
          }
        />
      )}
    </Space>
  );
}
