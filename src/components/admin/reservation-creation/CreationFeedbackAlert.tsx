import type { ReactNode } from "react";
import { Alert, Space, Typography } from "antd";
import type { CreationErrorFeedback } from "@/lib/helpers/admin-reservation-creation.helper";

const { Text } = Typography;

/** Refus du back : message (déjà traduit), complément propre à l'écran, détails (règles, nuits). */
export function CreationFeedbackAlert({ feedback, action }: { feedback: CreationErrorFeedback; action?: ReactNode }) {
  const warning = feedback.action === "retry-same-key";
  return (
    <Alert
      type={warning ? "warning" : "error"}
      showIcon
      message={feedback.message}
      action={action}
      description={
        feedback.hint || feedback.details.length > 0 ? (
          <Space direction="vertical" size={2}>
            {feedback.hint && <Text>{feedback.hint}</Text>}
            {feedback.details.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {feedback.details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </Space>
        ) : undefined
      }
    />
  );
}
