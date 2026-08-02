import { Progress } from "antd";

interface Props {
  score: number;
  max?: number;
  showInfo?: boolean;
  size?: "small" | "default";
  type?: "line" | "circle";
  width?: number;
}

function getScoreColor(score: number, max = 100): string {
  const pct = max === 100 ? score : (score / max) * 100;
  if (pct >= 90) return "#52c41a";
  if (pct >= 80) return "#1890ff";
  if (pct >= 60) return "#fa8c16";
  return "#ff4d4f";
}

export function ScoreProgress({
  score,
  max = 100,
  showInfo = true,
  size = "default",
  type = "line",
  width,
}: Props) {
  const pct = max === 100 ? score : Math.round((score / max) * 100);
  const color = getScoreColor(score, max);

  if (type === "circle") {
    return (
      <Progress
        type="circle"
        percent={pct}
        strokeColor={color}
        format={() => (
          <span style={{ color, fontWeight: 700, fontSize: width ? width * 0.2 : 24 }}>
            {score}
            {max !== 100 && (
              <span style={{ fontSize: "0.55em", color: "#999" }}>/{max}</span>
            )}
          </span>
        )}
        width={width ?? 120}
      />
    );
  }

  return (
    <Progress
      percent={pct}
      strokeColor={color}
      size={size}
      showInfo={showInfo}
      format={max !== 100 ? () => `${score}/${max}` : undefined}
    />
  );
}

export { getScoreColor };
