import React, { useState } from "react";
import { ProPerformanceFiltersBar } from "./pro-performance-filters";
import { ProPerformanceKpis } from "./pro-performance-kpis";
import { ProPerformanceTable } from "./pro-performance-table";
import { ProPerformanceDetailDrawer } from "./pro-performance-detail-drawer";
import { ProPerformanceFiltersState, ProPerformanceRow } from "./types";

export function ProPerformance() {
    const [filters, setFilters] = useState<ProPerformanceFiltersState>({ period: "month" });
    const [alerteCritique, setAlerteCritique] = useState(false);
    const [selectedRow, setSelectedRow] = useState<ProPerformanceRow | null>(null);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ProPerformanceFiltersBar
                filters={filters}
                onChange={setFilters}
                alerteCritique={alerteCritique}
                onAlerteCritiqueChange={setAlerteCritique}
            />
            <ProPerformanceKpis filters={filters} />
            <ProPerformanceTable
                filters={filters}
                alerteCritique={alerteCritique}
                onRowClick={setSelectedRow}
            />
            <ProPerformanceDetailDrawer
                proId={selectedRow?.proId ?? null}
                filters={filters}
                onClose={() => setSelectedRow(null)}
            />
        </div>
    );
}
