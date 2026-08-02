import React from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Drawer, Spin } from "antd";
import { ProPerformanceFiltersState, ProPerformanceRow } from "./types";
import { ProDetailContent } from "./pro-detail-content";

interface Props {
    proId: string | null;
    filters: ProPerformanceFiltersState;
    onClose: () => void;
}

export function ProPerformanceDetailDrawer({ proId, filters, onClose }: Props) {
    const apiUrl = useApiUrl();

    const { data, isFetching } = useCustom<{ data: ProPerformanceRow }>({
        url: `${apiUrl}/v1/statistics/pros/${proId}`,
        method: "get",
        config: { query: { period: filters.period, dateStart: filters.dateStart, dateEnd: filters.dateEnd, status: filters.status } },
        queryOptions: { enabled: !!proId },
    });

    const pro = data?.data as unknown as ProPerformanceRow | undefined;

    return (
        <Drawer
            open={!!proId}
            onClose={onClose}
            title={pro?.nom ?? "Détail Pro"}
            width={480}
        >
            {isFetching ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                    <Spin />
                </div>
            ) : pro ? (
                <ProDetailContent pro={pro} />
            ) : null}
        </Drawer>
    );
}
