import React, { useState } from "react";
import { Button, Space, Typography, theme } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  EyeOutlined,
  CalendarOutlined,
  HomeOutlined,
  BankOutlined,
  AppstoreOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Toast, useNotifications } from "@/contexts/notification-context";
import { WsNotificationType } from "@/hooks/useAdminNotificationsSocket";

const { Text } = Typography;
const { useToken } = theme;

const TYPE_COLOR: Record<string, string> = {
  urgent: "#E24B4A",
  warning: "#EF9F27",
  success: "#5DCAA5",
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  urgent: <WarningOutlined style={{ color: "white", fontSize: "20px" }} />,
  warning: <BellOutlined style={{ color: "white", fontSize: "20px" }} />,
  success: <CheckCircleOutlined style={{ color: "white", fontSize: "20px" }} />,
};

const WS_ICON: Record<WsNotificationType, React.ReactNode> = {
  nouvelle_reservation: <CalendarOutlined style={{ color: "white", fontSize: "18px" }} />,
  nouvelle_demande_visite: <HomeOutlined style={{ color: "white", fontSize: "18px" }} />,
  nouvelle_residence: <BankOutlined style={{ color: "white", fontSize: "18px" }} />,
  nouveau_bien_immobilier: <AppstoreOutlined style={{ color: "white", fontSize: "18px" }} />,
  nouvelle_demande_pro: <IdcardOutlined style={{ color: "white", fontSize: "18px" }} />,
};

const WS_COLOR: Record<WsNotificationType, string> = {
  nouvelle_reservation: "#185FA5",
  nouvelle_demande_visite: "#5DCAA5",
  nouvelle_residence: "#7B61FF",
  nouveau_bien_immobilier: "#EF9F27",
  nouvelle_demande_pro: "#E24B4A",
};

export const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const { token } = useToken();

  const accentColor = toast.wsType
    ? WS_COLOR[toast.wsType]
    : TYPE_COLOR[toast.type];

  const icon = toast.wsType
    ? WS_ICON[toast.wsType]
    : TYPE_ICON[toast.type];

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => dismissToast(toast.id), 400);
  };

  const handleView = () => {
    markAsRead(toast.id);
    if (toast.resourceLink) {
      navigate(toast.resourceLink);
    } else if (toast.reservationId) {
      navigate(`/reservations/edit/${toast.reservationId}`);
    }
    handleDismiss();
  };

  // Show the "Voir" button for:
  //   - WS notifications (always have a resourceLink)
  //   - Legacy urgent notifications (reservationId-based)
  const hasViewTarget = !!(toast.resourceLink || toast.reservationId);
  const showViewButton = hasViewTarget;

  return (
    <div
      className={`notification-toast ${isExiting ? "exit" : "enter"}`}
      style={{
        width: "350px",
        background: token.colorBgElevated,
        borderRadius: "8px",
        boxShadow: `0 10px 25px ${token.colorShadow}`,
        display: "flex",
        borderLeft: `4px solid ${accentColor}`,
        padding: "16px",
        position: "relative",
        transition: "all 0.4s ease",
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(120%); opacity: 0; }
        }
        .notification-toast.enter { animation: slideIn 0.4s ease forwards; }
        .notification-toast.exit  { animation: slideOut 0.4s ease forwards; }
      `}</style>

      {/* Icon circle */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Text strong style={{ fontSize: 14, display: "block" }}>
            {toast.title}
          </Text>
          <CloseOutlined
            onClick={handleDismiss}
            style={{ fontSize: 12, color: token.colorTextTertiary, cursor: "pointer", padding: 2 }}
          />
        </div>
        <Text style={{ fontSize: 12, color: token.colorTextSecondary, display: "block", marginTop: 4 }}>
          {toast.description}
        </Text>

        {showViewButton && (
          <Space style={{ marginTop: 10 }}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={handleView}
              style={{
                backgroundColor: token.colorPrimaryBg,
                color: token.colorPrimary,
                border: "none",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Voir
            </Button>
            <Button
              size="small"
              onClick={handleDismiss}
              style={{
                backgroundColor: token.colorFillSecondary,
                color: token.colorTextSecondary,
                border: "none",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              Ignorer
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
};
