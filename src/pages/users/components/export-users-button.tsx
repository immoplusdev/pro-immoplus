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
// Helpers: build the exact same query string the data provider uses
// ---------------------------------------------------------------------------

function buildFilterCriterias(filters: CrudFilter[]) {
    const criterias: Record<string, any>[] = [];
    filters.forEach((f) => {
        if (f.operator === "or" || f.operator === "and") return;
        const field = (f as any).field as string | undefined;
        if (!field || field === "q") return;
        if ((f as any).value === undefined || (f as any).value === null || (f as any).value === "")
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

/**
 * Fetches ALL users by iterating through all pages using the same
 * _page / _pageSize / _where / _search convention as the data provider.
 */
async function fetchAllUsers(filters: CrudFilter[] = []): Promise<any[]> {
    const PAGE_SIZE = 100; // on demande 100, l'API peut en retourner moins
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
            ? `${API_URL}/users?${qs}&${whereString}`
            : `${API_URL}/users?${qs}`;
    };

    // ── Étape 1 : page 1 → totalCount réel de l'API ──────────────────────
    const firstRes = await axiosInstance.get(buildUrl(1));
    const firstData = firstRes.data;

    // L'API retourne { data: [...], totalCount: N }
    const total: number = firstData.totalCount ?? firstData.data?.length ?? 0;
    const all: any[] = [...(firstData.data ?? [])];

    if (all.length >= total) return all; // tout tient sur page 1

    // ── CORRECTION CRITIQUE ───────────────────────────────────────────────
    // L'API peut ignorer _pageSize et retourner 10 items par page (ou autre).
    // Il faut calculer les pages sur la taille RÉELLEMENT retournée par l'API,
    // pas sur PAGE_SIZE=100 qu'on a demandé.
    // Ex : total=445, API retourne 10/page → 45 pages (et non 5 !)
    const actualPageSize = firstData.data?.length > 0 ? firstData.data.length : PAGE_SIZE;
    const totalPages = Math.ceil(total / actualPageSize);

    console.log(`[Export] total=${total} | taille/page réelle=${actualPageSize} | nb pages à récupérer=${totalPages}`);

    const remaining: number[] = [];
    for (let p = 2; p <= totalPages; p++) remaining.push(p);

    // Fetch par batch de 5 pour ne pas surcharger le serveur
    const BATCH = 5;
    for (let i = 0; i < remaining.length; i += BATCH) {
        const batch = remaining.slice(i, i + BATCH);
        const results = await Promise.all(
            batch.map((page) => axiosInstance.get(buildUrl(page)))
        );
        results.forEach((res) => {
            const items = res.data?.data ?? [];
            all.push(...items);
        });
    }

    return all;
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
        }).format(new Date(value));
    } catch {
        return value;
    }
}

function mapToRow(user: any, index: number): Record<string, string> {
    return {
        "#": String(index + 1),
        Nom: user.lastName ?? "-",
        Prénom: user.firstName ?? "-",
        Email: user.email ?? "-",
        Téléphone: user.phoneNumber ?? "-",   // champ correct : phoneNumber
        Rôle: user.role?.name ?? "-",
        // "Statut": user.status ?? "-",           // non utilisé pour l'instant
        // "Identité vérifiée": user.identityVerified ? "Oui" : "Non",  // non utilisé
        // "Compte pro validé": user.compteProValide ? "Oui" : "Non",   // non utilisé
        "Date de création": formatDate(user.createdAt),
    };
}

// ---------------------------------------------------------------------------
// Export functions
// ---------------------------------------------------------------------------

async function exportToExcel(filters: CrudFilter[], filename: string) {
    const users = await fetchAllUsers(filters);
    const rows = users.map(mapToRow);

    const ws = XLSX.utils.json_to_sheet(rows);
    // Auto column widths based on header names
    ws["!cols"] = Object.keys(rows[0] ?? {}).map((k) => ({ wch: Math.max(k.length + 2, 14) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Utilisateurs");
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    return users.length;
}

async function exportToCSV(filters: CrudFilter[], filename: string) {
    const users = await fetchAllUsers(filters);
    const rows = users.map(mapToRow);
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    // Prepend UTF-8 BOM so Excel opens accented characters correctly
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return users.length;
}

async function exportToPDF(filters: CrudFilter[], filename: string) {
    const users = await fetchAllUsers(filters);
    const rows = users.map(mapToRow);
    const headers = Object.keys(rows[0] ?? {});
    const body = rows.map((r) => headers.map((h) => r[h] ?? "-"));

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Header banner
    doc.setFillColor(30, 80, 160);
    doc.rect(0, 0, 297, 22, "F");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("ImmoPlus — Liste des Utilisateurs", 14, 14);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
        `Exporté le ${new Intl.DateTimeFormat("fr-FR").format(new Date())}  ·  ${users.length} utilisateur(s)`,
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
        margin: { left: 10, right: 10 },
    });

    doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
    return users.length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
    /** Active filters from the table (permanent + initial + search) */
    filters?: CrudFilter[];
    filenamePrefix?: string;
};

export const ExportUsersButton: React.FC<Props> = ({
    filters = [],
    filenamePrefix = "utilisateurs",
}) => {
    const [loading, setLoading] = useState(false);

    const handle = async (fn: () => Promise<number>) => {
        setLoading(true);
        const hide = message.loading("Export en cours, veuillez patienter…", 0);
        try {
            const count = await fn();
            hide();
            message.success(`✅ ${count} utilisateur(s) exporté(s) avec succès !`);
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
            onClick: () => handle(() => exportToPDF(filters, filenamePrefix)),
        },
        {
            key: "excel",
            label: "Télécharger en Excel (.xlsx)",
            icon: <FileExcelOutlined style={{ color: "#27ae60" }} />,
            onClick: () => handle(() => exportToExcel(filters, filenamePrefix)),
        },
        {
            key: "csv",
            label: "Télécharger en CSV",
            icon: <FileTextOutlined style={{ color: "#f39c12" }} />,
            onClick: () => handle(() => exportToCSV(filters, filenamePrefix)),
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
                icon={loading ? <LoadingOutlined spin /> : <DownloadOutlined />}
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E3DC",
                    color: "#5F5E5A",
                }}
            >
                {loading ? "Export en cours…" : "Télécharger"}
            </Button>
        </Dropdown>
    );
};
