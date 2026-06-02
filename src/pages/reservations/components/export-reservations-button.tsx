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
// Status labels
// ---------------------------------------------------------------------------

const STATUS_RESERVATION_LABELS: Record<string, string> = {
  rejete: "Rejeté",
  terminee: "Terminée",
  valide: "Validée",
  en_cours: "En cours",
  en_attente_reponse_proprietaire: "En attente réponse propriétaire",
  en_attente_paiement_client: "En attente paiement client",
  proprietaire_annule_reservation: "Propriétaire a annulé",
  proprietaire_sans_reponse: "Propriétaire sans réponse",
  client_annule_reservation: "Client a annulé",
  client_sans_reponse: "Client sans réponse",
};

// ---------------------------------------------------------------------------
// Helpers: build the same query string as the data provider
// ---------------------------------------------------------------------------

function buildFilterCriterias(filters: CrudFilter[]) {
  const criterias: Record<string, any>[] = [];
  filters.forEach((f) => {
    if (f.operator === "or" || f.operator === "and") return;
    const field = (f as any).field as string | undefined;
    if (!field || field === "q") return;
    if (
      (f as any).value === undefined ||
      (f as any).value === null ||
      (f as any).value === ""
    )
      return;
    criterias.push({
      _field: field,
      _op: f.operator,
      _val: (f as any).value,
    });
  });
  return criterias;
}

function buildSearchQuery(filters: CrudFilter[]): string | undefined {
  const searchFilter = filters.find((f) => (f as any).field === "q");
  return searchFilter ? (searchFilter as any).value : undefined;
}

async function fetchAllReservationsForFilters(
  filters: CrudFilter[]
): Promise<any[]> {
  const PAGE_SIZE = 100;
  const criterias = buildFilterCriterias(filters);
  const search = buildSearchQuery(filters);

  const baseQuery: Record<string, any> = {
    _page: 1,
    _pageSize: PAGE_SIZE,
    _order_by: "createdAt",
    _order_dir: "desc",
  };
  if (search) baseQuery._search = search;

  const whereString = serializeWhereParameterToQueryFiltersString(criterias);

  const buildUrl = (page: number) => {
    const qs = queryString.stringify({ ...baseQuery, _page: page });
    return whereString
      ? `${API_URL}/reservations?${qs}&${whereString}`
      : `${API_URL}/reservations?${qs}`;
  };

  const firstRes = await axiosInstance.get(buildUrl(1));
  const firstData = firstRes.data;
  const total: number = firstData.totalCount ?? firstData.data?.length ?? 0;
  const all: any[] = [...(firstData.data ?? [])];

  if (all.length >= total) return all;

  const actualPageSize =
    firstData.data?.length > 0 ? firstData.data.length : PAGE_SIZE;
  const totalPages = Math.ceil(total / actualPageSize);

  const remaining: number[] = [];
  for (let p = 2; p <= totalPages; p++) remaining.push(p);

  const BATCH = 5;
  for (let i = 0; i < remaining.length; i += BATCH) {
    const batch = remaining.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((page) => axiosInstance.get(buildUrl(page)))
    );
    results.forEach((res) => {
      all.push(...(res.data?.data ?? []));
    });
  }

  return all;
}

/**
 * Enrichit chaque réservation avec ses données complètes (client + propriétaire)
 * via GET /reservations/{id}, en batch de 5 pour ne pas surcharger le serveur.
 */
async function enrichWithDetails(reservations: any[]): Promise<any[]> {
  const BATCH = 5;
  const enriched: any[] = new Array(reservations.length);

  for (let i = 0; i < reservations.length; i += BATCH) {
    const batch = reservations.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((r) => axiosInstance.get(`${API_URL}/reservations/${r.id}`))
    );
    results.forEach((res, j) => {
      // GET /reservations/{id} retourne { data: { ...reservation, client: {}, proprietaire: {} } }
      enriched[i + j] = res.data?.data ?? res.data ?? reservations[i + j];
    });
  }

  return enriched;
}

/**
 * Fetches all reservations for one or two filter sets (merged + deduplicated),
 * puis enrichit chaque ligne avec les données client/propriétaire complètes.
 */
async function fetchAllReservations(
  filters: CrudFilter[],
  filtersB?: CrudFilter[]
): Promise<any[]> {
  let records: any[];

  if (!filtersB || filtersB.length === 0) {
    records = await fetchAllReservationsForFilters(filters);
  } else {
    const [setA, setB] = await Promise.all([
      fetchAllReservationsForFilters(filters),
      fetchAllReservationsForFilters(filtersB),
    ]);

    const seen = new Set<string>();
    records = [];
    for (const r of [...setA, ...setB]) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        records.push(r);
      }
    }
    records.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Enrichissement : récupère client + propriétaire pour chaque réservation
  return enrichWithDetails(records);
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const PROPRIETAIRE_STATUSES = new Set([
  "proprietaire_annule_reservation",
  "proprietaire_sans_reponse",
]);

function mapToRow(r: any, index: number): Record<string, string> {
  const status: string = r.statusReservation ?? "";
  const isProprietaire = PROPRIETAIRE_STATUSES.has(status);

  const personne = isProprietaire ? r.proprietaire : r.client;
  const role = isProprietaire ? "Propriétaire" : "Client";
  const nom = [personne?.firstName, personne?.lastName].filter(Boolean).join(" ") || "-";
  const telephone = isProprietaire
    ? (r.proprietaire?.phoneNumber ?? "-")
    : (r.clientPhoneNumber ?? r.client?.phoneNumber ?? "-");

  return {
    "#": String(index + 1),
    "Code réservation": r.codeReservation ?? "-",
    "Statut réservation": STATUS_RESERVATION_LABELS[status] ?? status ?? "-",
    "Rôle": role,
    "Nom complet": nom,
    "Téléphone": telephone,
    "Email": personne?.email ?? "-",
    "Date de création": formatDate(r.createdAt),
  };
}

// ---------------------------------------------------------------------------
// Export functions
// ---------------------------------------------------------------------------

async function exportToExcel(
  filters: CrudFilter[],
  filtersB: CrudFilter[] | undefined,
  filename: string
) {
  const reservations = await fetchAllReservations(filters, filtersB);
  const rows = reservations.map(mapToRow);

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] ?? {}).map((k) => ({
    wch: Math.max(k.length + 2, 16),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Réservations");
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  return reservations.length;
}

async function exportToCSV(
  filters: CrudFilter[],
  filtersB: CrudFilter[] | undefined,
  filename: string
) {
  const reservations = await fetchAllReservations(filters, filtersB);
  const rows = reservations.map(mapToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return reservations.length;
}

async function exportToPDF(
  filters: CrudFilter[],
  filtersB: CrudFilter[] | undefined,
  filename: string
) {
  const reservations = await fetchAllReservations(filters, filtersB);
  const rows = reservations.map(mapToRow);
  const headers = Object.keys(rows[0] ?? {});
  const body = rows.map((r) => headers.map((h) => r[h] ?? "-"));

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFillColor(30, 80, 160);
  doc.rect(0, 0, 297, 22, "F");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("ImmoPlus — Liste des Réservations", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Exporté le ${new Intl.DateTimeFormat("fr-FR").format(new Date())}  ·  ${reservations.length} réservation(s)`,
    14,
    20
  );

  autoTable(doc, {
    head: [headers],
    body,
    startY: 26,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [30, 80, 160], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    tableLineColor: [200, 210, 230],
    tableLineWidth: 0.2,
    margin: { left: 8, right: 8 },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
  return reservations.length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  /** Active filters for the primary fetch */
  filters?: CrudFilter[];
  /** Secondary filter set — used for "Toutes" tab double-fetch merge */
  filtersB?: CrudFilter[];
  filenamePrefix?: string;
};

export const ExportReservationsButton: React.FC<Props> = ({
  filters = [],
  filtersB,
  filenamePrefix = "reservations",
}) => {
  const [loading, setLoading] = useState(false);

  const handle = async (fn: () => Promise<number>) => {
    setLoading(true);
    const hide = message.loading("Export en cours, veuillez patienter…", 0);
    try {
      const count = await fn();
      hide();
      message.success(`✅ ${count} réservation(s) exportée(s) avec succès !`);
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
        handle(() => exportToPDF(filters, filtersB, filenamePrefix)),
    },
    {
      key: "excel",
      label: "Télécharger en Excel (.xlsx)",
      icon: <FileExcelOutlined style={{ color: "#27ae60" }} />,
      onClick: () =>
        handle(() => exportToExcel(filters, filtersB, filenamePrefix)),
    },
    {
      key: "csv",
      label: "Télécharger en CSV",
      icon: <FileTextOutlined style={{ color: "#f39c12" }} />,
      onClick: () =>
        handle(() => exportToCSV(filters, filtersB, filenamePrefix)),
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      disabled={loading}
      trigger={["click"]}
    >
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
