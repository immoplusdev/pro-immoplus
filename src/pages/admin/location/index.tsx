import { useMemo } from "react";
import { Button, Segmented, Space, Spin, Typography } from "antd";
import { EnvironmentOutlined, TableOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useLocationExport } from "@/hooks/useAdminLocation";
import { useUrlFilters } from "@/components/admin/common/useUrlFilters";
import {
  LocationExportFilters,
  type LocationExportFilterValues,
} from "@/components/admin/location/LocationExportFilters";
import { LocationExportTable, type LocationExportRow } from "@/components/admin/location/LocationExportTable";
import { LocationExportMap } from "@/components/admin/location/LocationExportMap";
import { ExportCsvButton } from "@/components/admin/location/ExportCsvButton";
import { LocationErrorAlert } from "@/components/admin/location/LocationErrorAlert";
import { API_DATE_FORMAT } from "@/components/admin/location/format";
import { isLocationRole } from "@/types/location.types";

const { Title, Text } = Typography;

const PAGE_SIZES = [20, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 20;
type View = "table" | "map";

const isApiDate = (v: string | undefined): v is string => !!v && dayjs(v, API_DATE_FORMAT, true).isValid();

/** Export BI des positions liées aux actions métier (admin uniquement — route protégée par AdminRoute). */
export function LocationExportPage() {
  const { values, update, page } = useUrlFilters(["from", "to", "role", "city", "limit", "view"] as const);

  // Valeurs d'URL validées : une URL bricolée ne produit pas de requête invalide.
  const applied = useMemo<LocationExportFilterValues>(() => {
    const hasRange = isApiDate(values.from) && isApiDate(values.to);
    return {
      from: hasRange ? values.from : undefined,
      to: hasRange ? values.to : undefined,
      role: isLocationRole(values.role) ? values.role : undefined,
      city: values.city?.trim() || undefined,
    };
  }, [values]);

  const limitParam = Number(values.limit);
  const limit = (PAGE_SIZES as readonly number[]).includes(limitParam) ? limitParam : DEFAULT_PAGE_SIZE;
  const view: View = values.view === "map" ? "map" : "table";

  const { data, isInitialLoading, isFetching, isError, error, refetch } = useLocationExport({
    ...applied,
    page,
    limit,
  });

  const rows = useMemo<LocationExportRow[]>(
    () =>
      (data?.items ?? []).map((item, i) => ({
        ...item,
        key: `${(data?.page ?? page) - 1}-${i}-${item.userId}-${item.capturedAt}`,
      })),
    [data, page]
  );

  const onSearch = (next: LocationExportFilterValues) =>
    update({ from: next.from, to: next.to, role: next.role, city: next.city });

  // Réinitialise filtres, taille de page et pagination, en gardant la vue courante (table / carte).
  const onReset = () => update({ from: undefined, to: undefined, role: undefined, city: undefined, limit: undefined });

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Localisation — Export
          </Title>
          <Text type="secondary">
            Positions capturées lors des actions métier. Données internes et sensibles : chaque consultation est
            journalisée.
          </Text>
        </div>
        <Space wrap>
          <Segmented<View>
            aria-label="Affichage"
            value={view}
            onChange={(v) => update({ view: v === "map" ? "map" : undefined, page: String(page) })}
            options={[
              { value: "table", label: "Table", icon: <TableOutlined /> },
              { value: "map", label: "Carte", icon: <EnvironmentOutlined /> },
            ]}
          />
          <ExportCsvButton filters={applied} knownTotal={data?.total} disabled={isError} />
        </Space>
      </Space>

      <LocationExportFilters
        key={`${applied.from}|${applied.to}|${applied.role}|${applied.city}`}
        value={applied}
        onSearch={onSearch}
        onReset={onReset}
      />

      {isError ? (
        <LocationErrorAlert error={error} onRetry={() => refetch()} />
      ) : view === "table" ? (
        <LocationExportTable
          rows={rows}
          loading={isInitialLoading || isFetching}
          pagination={{
            current: data?.page ?? page,
            pageSize: data?.limit ?? limit,
            total: data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZES.map(String),
            showTotal: (total) => `${total} position(s)`,
            onChange: (p, size) =>
              size !== limit
                ? update({ limit: size === DEFAULT_PAGE_SIZE ? undefined : String(size) })
                : update({ page: String(p) }),
          }}
        />
      ) : (
        <Spin spinning={isInitialLoading || isFetching}>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
              <Text type="secondary">
                Page {data?.page ?? page} — {rows.length} position(s) affichée(s) sur {data?.total ?? 0}
              </Text>
              <Space>
                <Button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                  Page précédente
                </Button>
                <Button
                  disabled={!data || page * limit >= data.total}
                  onClick={() => update({ page: String(page + 1) })}
                >
                  Page suivante
                </Button>
              </Space>
            </Space>
            <LocationExportMap rows={rows} />
          </Space>
        </Spin>
      )}
    </div>
  );
}
