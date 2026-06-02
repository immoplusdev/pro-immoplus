import React, { useState } from "react";
import { Button, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import {
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_URL } from "@/configs/app.config";
import { axiosInstance } from "@/lib/providers/utils";
import type { CrudFilter } from "@refinedev/core/src/contexts/data/types";
import { serializeWhereParameterToQueryFiltersString } from "@/lib/helpers";
import queryString from "query-string";

// ---------------------------------------------------------------------------
// Core fetch
// ---------------------------------------------------------------------------

function buildFilterCriterias(filters: CrudFilter[]) {
  const criterias: Record<string, any>[] = [];
  filters.forEach((f) => {
    if (f.operator === "or" || f.operator === "and") return;
    const field = (f as any).field as string | undefined;
    if (!field || field === "q") return;
    if ((f as any).value === undefined || (f as any).value === null || (f as any).value === "")
      return;
    criterias.push({ _field: field, _op: f.operator, _val: (f as any).value });
  });
  return criterias;
}

function buildSearchQuery(filters: CrudFilter[]): string | undefined {
  const f = filters.find((f) => (f as any).field === "q");
  return f ? (f as any).value : undefined;
}

async function fetchAllRecords(resource: string, filters: CrudFilter[]): Promise<any[]> {
  const PAGE_SIZE = 100;
  const criterias = buildFilterCriterias(filters);
  const search = buildSearchQuery(filters);

  const base: Record<string, any> = {
    _page: 1,
    _pageSize: PAGE_SIZE,
    _order_by: "createdAt",
    _order_dir: "desc",
  };
  if (search) base._search = search;

  const whereString = serializeWhereParameterToQueryFiltersString(criterias);
  const buildUrl = (page: number) => {
    const qs = queryString.stringify({ ...base, _page: page });
    return whereString
      ? `${API_URL}/${resource}?${qs}&${whereString}`
      : `${API_URL}/${resource}?${qs}`;
  };

  const firstRes = await axiosInstance.get(buildUrl(1));
  const firstData = firstRes.data;
  const total: number = firstData.totalCount ?? firstData.data?.length ?? 0;
  const all: any[] = [...(firstData.data ?? [])];
  if (all.length >= total) return all;

  const actualPageSize = firstData.data?.length > 0 ? firstData.data.length : PAGE_SIZE;
  const totalPages = Math.ceil(total / actualPageSize);

  const remaining: number[] = [];
  for (let p = 2; p <= totalPages; p++) remaining.push(p);

  const BATCH = 5;
  for (let i = 0; i < remaining.length; i += BATCH) {
    const results = await Promise.all(
      remaining.slice(i, i + BATCH).map((p) => axiosInstance.get(buildUrl(p)))
    );
    results.forEach((res) => all.push(...(res.data?.data ?? [])));
  }
  return all;
}

// ---------------------------------------------------------------------------
// Export functions
// ---------------------------------------------------------------------------

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export { formatDate as exportFormatDate };

async function doExcelExport(
  resource: string,
  filters: CrudFilter[],
  mapRow: (r: any, i: number) => Record<string, string>,
  filename: string
) {
  const records = await fetchAllRecords(resource, filters);
  const rows = records.map(mapRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] ?? {}).map((k) => ({ wch: Math.max(k.length + 2, 16) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Export");
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  return records.length;
}

async function doCSVExport(
  resource: string,
  filters: CrudFilter[],
  mapRow: (r: any, i: number) => Record<string, string>,
  filename: string
) {
  const records = await fetchAllRecords(resource, filters);
  const rows = records.map(mapRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return records.length;
}

async function doPDFExport(
  resource: string,
  filters: CrudFilter[],
  mapRow: (r: any, i: number) => Record<string, string>,
  pdfTitle: string,
  filename: string
) {
  const records = await fetchAllRecords(resource, filters);
  const rows = records.map(mapRow);
  const headers = Object.keys(rows[0] ?? {});
  const body = rows.map((r) => headers.map((h) => r[h] ?? "-"));

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFillColor(30, 80, 160);
  doc.rect(0, 0, 297, 22, "F");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(`ImmoPlus — ${pdfTitle}`, 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Exporté le ${new Intl.DateTimeFormat("fr-FR").format(new Date())}  ·  ${records.length} enregistrement(s)`,
    14,
    20
  );
  autoTable(doc, {
    head: [headers],
    body,
    startY: 26,
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [30, 80, 160], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    tableLineColor: [200, 210, 230],
    tableLineWidth: 0.2,
    margin: { left: 8, right: 8 },
  });
  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
  return records.length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export type ExportTableButtonProps = {
  resource: string;
  mapToRow: (record: any, index: number) => Record<string, string>;
  pdfTitle: string;
  filters?: CrudFilter[];
  filenamePrefix?: string;
};

export const ExportTableButton: React.FC<ExportTableButtonProps> = ({
  resource,
  mapToRow,
  pdfTitle,
  filters = [],
  filenamePrefix = "export",
}) => {
  const [loading, setLoading] = useState(false);

  const handle = async (fn: () => Promise<number>) => {
    setLoading(true);
    const hide = message.loading("Export en cours, veuillez patienter…", 0);
    try {
      const count = await fn();
      hide();
      message.success(`✅ ${count} enregistrement(s) exporté(s) avec succès !`);
    } catch (err) {
      hide();
      console.error("[Export] error:", err);
      message.error("❌ Erreur lors de l'export. Vérifiez votre connexion et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "pdf",
      label: "Télécharger en PDF",
      icon: <FilePdfOutlined style={{ color: "#e74c3c" }} />,
      onClick: () =>
        handle(() => doPDFExport(resource, filters, mapToRow, pdfTitle, filenamePrefix)),
    },
    {
      key: "excel",
      label: "Télécharger en Excel (.xlsx)",
      icon: <FileExcelOutlined style={{ color: "#27ae60" }} />,
      onClick: () =>
        handle(() => doExcelExport(resource, filters, mapToRow, filenamePrefix)),
    },
    {
      key: "csv",
      label: "Télécharger en CSV",
      icon: <FileTextOutlined style={{ color: "#f39c12" }} />,
      onClick: () =>
        handle(() => doCSVExport(resource, filters, mapToRow, filenamePrefix)),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" disabled={loading} trigger={["click"]}>
      <Button
        type="primary"
        icon={loading ? <LoadingOutlined spin /> : <DownloadOutlined />}
        style={{
          background: "linear-gradient(135deg, #1e50a0 0%, #2e86de 100%)",
          border: "none",
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(30,80,160,0.3)",
        }}
      >
        {loading ? "Export en cours…" : "Télécharger"}
      </Button>
    </Dropdown>
  );
};
