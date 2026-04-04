import { CrudFilter, useList, useTranslate } from "@refinedev/core";
import { List } from "@refinedev/antd";
import { Button, Pagination, Spin } from "antd";
import { Link } from "react-router-dom";
import React, { useCallback, useState } from "react";
import { ReservationCard } from "@/pages/reservations/components/reservation-card";

const PAGE_SIZE = 20;

type Props = {
  activeMenu: "all_e" | "valide_termine" | "en_validation" | "echoue_annule";
  filtersA?: CrudFilter[];
  filtersB?: CrudFilter[];
  orderByField?: "createdAt" | "updatedAt";
};

export function ReservationMergedTable({
  activeMenu,
  filtersA = [],
  filtersB = [],
  orderByField = "createdAt",
}: Props) {
  const translate = useTranslate();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: dataA, isLoading: loadingA, refetch: refetchA } = useList({
    resource: "reservations",
    pagination: { current: currentPage, pageSize: PAGE_SIZE },
    sorters: [{ field: orderByField, order: "desc" }],
    filters: filtersA,
  });

  const { data: dataB, isLoading: loadingB, refetch: refetchB } = useList({
    resource: "reservations",
    pagination: { current: currentPage, pageSize: PAGE_SIZE },
    sorters: [{ field: orderByField, order: "desc" }],
    filters: filtersB,
  });

  const loading = loadingA || loadingB;

  const totalA = dataA?.total ?? 0;
  const totalB = dataB?.total ?? 0;
  const totalPages = Math.max(
    Math.ceil(totalA / PAGE_SIZE) || 1,
    Math.ceil(totalB / PAGE_SIZE) || 1
  );
  const totalItems = totalA + totalB;

  const mergedData = [
    ...(dataA?.data ?? []),
    ...(dataB?.data ?? []),
  ].sort(
    (a: any, b: any) =>
      new Date(b[orderByField]).getTime() - new Date(a[orderByField]).getTime()
  );

  const refetchAll = useCallback(() => {
    refetchA();
    refetchB();
  }, [refetchA, refetchB]);

  return (
    <List
      title={translate("pages.reservation.reservations")}
      headerButtons={[
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
      <Spin spinning={loading}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mergedData.map((record: any) => (
            <ReservationCard
              key={record.id}
              record={record}
              onExpire={refetchAll}
            />
          ))}
          {!loading && mergedData.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "#999",
                fontSize: 14,
              }}
            >
              Aucune réservation
            </div>
          )}
        </div>
      </Spin>

      {totalItems > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={totalPages * PAGE_SIZE}
            onChange={(page) => setCurrentPage(page)}
            showTotal={() => `${totalItems} réservations au total`}
            showSizeChanger={false}
          />
        </div>
      )}
    </List>
  );
}
