import { Empty } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CountEntry, TimelineBucket } from "@/lib/helpers/failure-reasons.helper";

const ROW_HEIGHT = 34;

/** Barres horizontales déjà triées (desc), libellé "n (x %)" en bout de barre. */
export function HorizontalCountChart({ data, color }: { data: CountEntry[]; color: string }) {
  if (data.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune réponse" />;

  const chartData = data.map((e) => ({ ...e, display: `${e.count} (${e.percent.toLocaleString("fr-FR")} %)` }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(90, data.length * ROW_HEIGHT + 30)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 90, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis type="category" dataKey="label" width={230} tick={{ fontSize: 12 }} interval={0} />
        <Tooltip formatter={(value) => [String(value), "Réponses"]} />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} maxBarSize={22}>
          <LabelList dataKey="display" position="right" style={{ fontSize: 12, fill: "#595959" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Évolution du nombre de réponses (jour ou semaine). */
export function TimelineChart({ data }: { data: TimelineBucket[] }) {
  if (data.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune réponse" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={8} />
        <YAxis allowDecimals={false} width={40} />
        <Tooltip formatter={(value) => [String(value), "Réponses"]} />
        <Bar dataKey="count" fill="#1677ff" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
