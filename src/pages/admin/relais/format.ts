export function formatFcfa(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}
