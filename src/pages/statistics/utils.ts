export type PeriodeType = "jour" | "semaine" | "mois";

export interface StatItem {
    periode: string | number;
    total: number;
}

export const periodeOptions = [
    { label: "Jour", value: "jour" },
    { label: "Semaine", value: "semaine" },
    { label: "Mois", value: "mois" },
];

export const formatPeriode = (periode: string | number, type: PeriodeType): string => {
    if (type === "jour") {
        const date = new Date(String(periode));
        if (isNaN(date.getTime())) return String(periode);
        return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    }
    if (type === "semaine") {
        const str = String(periode);
        if (str.length < 5) return str;
        const year = str.slice(0, 4);
        const week = str.slice(4).padStart(2, "0");
        return `S${week} ${year}`;
    }
    // mois: "2025-10"
    const str = String(periode);
    const parts = str.split("-");
    if (parts.length < 2) return str;
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    if (isNaN(date.getTime())) return str;
    return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};
