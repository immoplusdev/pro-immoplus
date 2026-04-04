import React, { useEffect, useState } from "react";
import { Button, Space, Typography } from "antd";
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  CloseOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Toast, useNotifications } from "@/contexts/notification-context";

const { Text } = Typography;

export const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const colors = {
    urgent: "#E24B4A",
    warning: "#EF9F27",
    success: "#5DCAA5",
  };

  const icons = {
    urgent: <WarningOutlined style={{ color: "white", fontSize: "20px" }} />,
    warning: <BellOutlined style={{ color: "white", fontSize: "20px" }} />,
    success: <CheckCircleOutlined style={{ color: "white", fontSize: "20px" }} />,
  };

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => dismissToast(toast.id), 400);
  };

  const handleView = () => {
    markAsRead(toast.id);
    if (toast.reservationId) {
      navigate(`/reservations/edit/${toast.reservationId}`);
    }
    handleDismiss();
  };

  return (
    <div
      className={`notification-toast ${isExiting ? "exit" : "enter"}`}
      style={{
        width: "350px",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        display: "flex",
        borderLeft: `4px solid ${colors[toast.type]}`,
        padding: "16px",
        position: "relative",
        transition: "all 0.4s ease",
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(120%); opacity: 0; }
        }
        .notification-toast.enter {
          animation: slideIn 0.4s ease forwards;
        }
        .notification-toast.exit {
          animation: slideOut 0.4s ease forwards;
        }
      `}</style>
      
      <div 
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: colors[toast.type],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "12px",
          flexShrink: 0
        }}
      >
        {icons[toast.type]}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Text strong style={{ fontSize: "14px", display: "block" }}>{toast.title}</Text>
          <CloseOutlined 
             onClick={handleDismiss}
             style={{ fontSize: "12px", color: "#999", cursor: "pointer", padding: "2px" }} 
          />
        </div>
        <Text style={{ fontSize: "12px", color: "#666", display: "block", marginTop: "4px" }}>
          {toast.description}
        </Text>
        
        {toast.type === "urgent" && (
          <Space style={{ marginTop: "12px" }}>
            <Button 
               size="small" 
               icon={<EyeOutlined />}
               onClick={handleView}
               style={{ 
                 backgroundColor: "#EEEDFE", 
                 color: "#3C3489", 
                 border: "none",
                 borderRadius: "4px",
                 fontSize: "12px",
                 fontWeight: 600
               }}
            >
              Voir
            </Button>
            <Button 
               size="small" 
               onClick={handleDismiss}
               style={{ 
                 backgroundColor: "#f0f0f0", 
                 color: "#666", 
                 border: "none",
                 borderRadius: "4px",
                 fontSize: "12px"
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
