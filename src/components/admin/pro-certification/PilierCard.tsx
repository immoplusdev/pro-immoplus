import type { ReactNode } from "react";
import { Card, Typography } from "antd";
import { ScoreProgress } from "./ScoreProgress";

const { Text, Title } = Typography;

interface PilierCardProps {
  title: string;
  score: number | null;
  maxScore: number;
  children?: ReactNode;
  extra?: ReactNode;
}

export function PilierCard({ title, score, maxScore, children, extra }: PilierCardProps) {
  const displayScore = score ?? 0;

  return (
    <Card
      size="small"
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {score === null ? "—" : `${displayScore}`}/{maxScore} pts
          </Text>
        </div>
      }
      extra={extra}
      style={{ marginBottom: 16 }}
    >
      {score === null ? (
        <ScoreProgress score={0} max={maxScore} showInfo={false} size="small" />
      ) : (
        <ScoreProgress score={displayScore} max={maxScore} size="small" />
      )}
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </Card>
  );
}
