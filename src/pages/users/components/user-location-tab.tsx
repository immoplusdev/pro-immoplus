import { useEffect, useMemo, useState } from "react";
import { DatePicker, Empty, Skeleton, Space, Spin, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useUserLocationHistory } from "@/hooks/useAdminLocation";
import { LocationTrackMap } from "@/components/admin/location/LocationTrackMap";
import { LocationPointsTable } from "@/components/admin/location/LocationPointsTable";
import { LocationErrorAlert } from "@/components/admin/location/LocationErrorAlert";
import { API_DATE_FORMAT } from "@/components/admin/location/format";
import type { LocationDateRange } from "@/types/location.types";

const { RangePicker } = DatePicker;
const { Text } = Typography;

type RangeValue = [Dayjs, Dayjs] | null;

const defaultRange = (): RangeValue => [dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")];

/** Dates locales formatées telles quelles (pas de passage par l'UTC, qui décalerait d'un jour). */
function toApiRange(value: RangeValue): LocationDateRange | null {
  if (!value) return null;
  return { from: value[0].format(API_DATE_FORMAT), to: value[1].format(API_DATE_FORMAT) };
}

/** Onglet "Localisation" de la fiche utilisateur (admin uniquement — masqué par l'appelant). */
export function UserLocationTab({ userId }: { userId: string | undefined }) {
  const [range, setRange] = useState<RangeValue>(defaultRange);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const apiRange = useMemo(() => toApiRange(range), [range]);
  const { data, isInitialLoading, isFetching, isError, error, refetch } = useUserLocationHistory(userId, apiRange);

  // L'API renvoie les points déjà triés par capturedAt croissant.
  const points = useMemo(() => data?.items ?? [], [data]);

  useEffect(() => setSelectedIndex(null), [points]);

  const renderContent = () => {
    if (!apiRange) {
      return <Empty description="Choisissez une période pour afficher les positions" />;
    }
    if (isError) return <LocationErrorAlert error={error} onRetry={() => refetch()} />;
    if (isInitialLoading) return <Skeleton active paragraph={{ rows: 8 }} />;
    if (points.length === 0) return <Empty description="Aucune position sur cette période" />;

    return (
      <Spin spinning={isFetching}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <LocationTrackMap points={points} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
          <LocationPointsTable points={points} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
        </Space>
      </Spin>
    );
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space wrap align="center">
        <Text>Période :</Text>
        <RangePicker
          aria-label="Période"
          format="DD/MM/YYYY"
          value={range}
          allowClear
          disabledDate={(d) => d.isAfter(dayjs(), "day")}
          onChange={(value) => setRange(value && value[0] && value[1] ? [value[0], value[1]] : null)}
        />
        {points.length > 0 && <Text type="secondary">{points.length} position(s)</Text>}
      </Space>
      {renderContent()}
    </Space>
  );
}
