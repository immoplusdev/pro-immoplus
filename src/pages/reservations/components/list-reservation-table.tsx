import { CrudFilter } from "@refinedev/core/src/contexts/data/types";
import { useTranslate } from "@refinedev/core";
import { List, useTable } from "@refinedev/antd";
import { Button, Pagination, Spin, theme } from "antd";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { SearchInput } from "@/components/filters";
import { ReservationCard } from "@/pages/reservations/components/reservation-card";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";

// ─── config sous-filtres par onglet ───────────────────────────────────────
const SUB_FILTERS: Record<string, Array<{ key: string; label: string; value: string | null }>> = {
  en_validation: [
    { key: "tous", label: "Tous", value: null },
    {
      key: StatusReservation.EnAttenteReponseProprietaire,
      label: "En attente du pro",
      value: StatusReservation.EnAttenteReponseProprietaire,
    },
    {
      key: StatusReservation.EnAttentePaiementClient,
      label: "En attente paiement client",
      value: StatusReservation.EnAttentePaiementClient,
    },
  ],
  echoue_annule: [
    { key: "tous", label: "Tous", value: null },
    {
      key: StatusReservation.ProprietaireAnnuleReservation,
      label: "Propriétaire a annulé la réservation",
      value: StatusReservation.ProprietaireAnnuleReservation,
    },
    {
      key: StatusReservation.ProprietaireSansReponse,
      label: "Propriétaire sans réponse",
      value: StatusReservation.ProprietaireSansReponse,
    },
    {
      key: StatusReservation.ClientSansReponse,
      label: "Client sans réponse",
      value: StatusReservation.ClientSansReponse,
    },
    {
      key: StatusReservation.clientAnnuleReservation,
      label: "Client a annulé la réservation",
      value: StatusReservation.clientAnnuleReservation,
    },
  ],
};

// ─── props ─────────────────────────────────────────────────────────────────
type Props = {
  activeMenu: "all_e" | "valide_termine" | "en_validation" | "echoue_annule";
  filters?: {
    initial?: CrudFilter[];
    permanent?: CrudFilter[];
    mode?: "server" | "off";
  };
  defaultSortField?: "createdAt" | "updatedAt";
  /**
   * Filtres non-permanents à restaurer quand l'utilisateur clique "Tous".
   * Doit correspondre aux filtres passés dans filters.initial.
   */
  defaultNonPermanentFilters?: CrudFilter[];
};

// ─── composant ─────────────────────────────────────────────────────────────
export function ListReservationTable({
  activeMenu,
  filters,
  defaultSortField = "createdAt",
  defaultNonPermanentFilters = [],
}: Props) {
  const translate = useTranslate();
  const { token } = theme.useToken();
  const [activeSubFilter, setActiveSubFilter] = useState<string>("tous");

  const {
    tableProps,
    filters: searchFilters,
    setFilters,
    tableQuery,
    current,
    setCurrent,
    pageSize,
  } = useTable({
    resource: "reservations",
    syncWithLocation: true,
    sorters: {
      initial: [{ field: defaultSortField, order: "desc" }],
    },
    filters,
  });

  const { dataSource, loading } = tableProps;
  const total = tableQuery.data?.total ?? 0;

  const subFilters = SUB_FILTERS[activeMenu] ?? [];
  const hasSubFilters = subFilters.length > 0;

  const handleSubFilter = (key: string, value: string | null) => {
    setActiveSubFilter(key);
    if (value === null) {
      // "Tous" → restaure les filtres initiaux (ex: statusReservation in [...])
      setFilters(defaultNonPermanentFilters, "replace");
    } else {
      // Sous-filtre spécifique → remplace le filtre non-permanent sur statusReservation
      // permanent[statusFacture=non_paye] reste intact et en _where[0]
      setFilters(
        [{ field: "statusReservation", operator: "eq", value }],
        "replace"
      );
    }
  };

  return (
    <>
      <style>{`
        @keyframes subFilterFadeSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <List
        title={translate("pages.reservation.reservations")}
        headerButtons={[
          <SearchInput
            filters={searchFilters}
            setFilters={setFilters}
            tableQuery={tableQuery}
          />,
          <Link to="/reservations">
            <Button type={activeMenu === "all_e" ? "primary" : "default"}>
              {translate("tags.all_e")}
            </Button>
          </Link>,
          <Link to="/reservations/valide-termine">
            <Button type={activeMenu === "valide_termine" ? "primary" : "default"}>
              {translate("reservations.fields.valide_termine")}
            </Button>
          </Link>,
          <Link to="/reservations/en-validation">
            <Button type={activeMenu === "en_validation" ? "primary" : "default"}>
              {translate("reservations.fields.en_validation")}
            </Button>
          </Link>,
          <Link to="/reservations/echoue-annule">
            <Button
              type={activeMenu === "echoue_annule" ? "primary" : "default"}
              danger={activeMenu === "echoue_annule"}
            >
              {translate("reservations.fields.echoue_annule")}
            </Button>
          </Link>,
        ]}
      >
        {/* ── barre de sous-filtres (animée à l'apparition) ─────────── */}
        {hasSubFilters && (
          <div
            key={activeMenu}
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              animation: "subFilterFadeSlide 0.2s ease-out",
            }}
          >
            {subFilters.map((f) => {
              const isActive = activeSubFilter === f.key;
              const isDanger = activeMenu === "echoue_annule" && f.key !== "tous";
              return (
                <Button
                  key={f.key}
                  size="small"
                  type={isActive ? "primary" : "default"}
                  danger={isDanger && isActive}
                  onClick={() => handleSubFilter(f.key, f.value)}
                  style={{
                    borderRadius: 100,
                    fontSize: 12,
                    transition: "all 0.15s ease",
                  }}
                >
                  {f.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* ── liste des cards ───────────────────────────────────────── */}
        <Spin spinning={!!loading}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(dataSource ?? []).map((record: any) => (
              <ReservationCard
                key={record.id}
                record={record}
                onExpire={() => tableQuery.refetch()}
              />
            ))}
            {!loading && (dataSource ?? []).length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 0",
                  color: token.colorTextTertiary,
                  fontSize: 14,
                }}
              >
                Aucune réservation
              </div>
            )}
          </div>
        </Spin>

        {/* ── pagination ───────────────────────────────────────────── */}
        {total > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Pagination
              current={current}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setCurrent(page)}
              showTotal={(t) => `${t} réservations`}
              showSizeChanger={false}
            />
          </div>
        )}
      </List>
    </>
  );
}
