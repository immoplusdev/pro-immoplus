import React from "react";
import ReactDOM from "react-dom";
import { useNotifications } from "@/contexts/notification-context";
import { ToastItem } from "./toast-item";

export const ToastManager: React.FC = () => {
  const { activeToasts } = useNotifications();

  return ReactDOM.createPortal(
    <div
      id="notification-toast-container"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column-reverse",
        gap: "10px",
        pointerEvents: "none",
      }}
    >
      {activeToasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>,
    document.body
  );
};
