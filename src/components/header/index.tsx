import {
  BellOutlined,
  DownOutlined,
  CalendarOutlined,
  HomeOutlined,
  BankOutlined,
  AppstoreOutlined,
  IdcardOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity, useSetLocale } from "@refinedev/core";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Layout as AntdLayout,
  List,
  MenuProps,
  Space,
  Switch,
  Tooltip,
  theme,
  Typography,
} from "antd";
import React, { useContext } from "react";
import { ColorModeContext } from "@/contexts/color-mode";
import { useNotifications } from "@/contexts/notification-context";
import { WsNotificationType } from "@/hooks/useAdminNotificationsSocket";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

// ─── icon & dot-colour per WS notification type ────────────────────────────

const WS_TYPE_ICON: Record<WsNotificationType, React.ReactNode> = {
  nouvelle_reservation: <CalendarOutlined style={{ fontSize: 13 }} />,
  nouvelle_demande_visite: <HomeOutlined style={{ fontSize: 13 }} />,
  nouvelle_residence: <BankOutlined style={{ fontSize: 13 }} />,
  nouveau_bien_immobilier: <AppstoreOutlined style={{ fontSize: 13 }} />,
  nouvelle_demande_pro: <IdcardOutlined style={{ fontSize: 13 }} />,
};

const WS_TYPE_COLOR: Record<WsNotificationType, string> = {
  nouvelle_reservation: "#185FA5",
  nouvelle_demande_visite: "#5DCAA5",
  nouvelle_residence: "#7B61FF",
  nouveau_bien_immobilier: "#EF9F27",
  nouvelle_demande_pro: "#E24B4A",
};

const NOTIF_TYPE_DOT: Record<string, string> = {
  urgent: "#E24B4A",
  warning: "#EF9F27",
  success: "#5DCAA5",
};

// ─── NotificationBell ───────────────────────────────────────────────────────

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, wsConnected, wsError } =
    useNotifications();
  const navigate = useNavigate();
  const { token } = useToken();

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id);
    if (n.resourceLink) {
      navigate(n.resourceLink);
    } else if (n.reservationId) {
      navigate(`/reservations/edit/${n.reservationId}`);
    }
  };

  const notificationContent = (
    <div
      style={{
        width: "340px",
        background: token.colorBgElevated,
        borderRadius: "8px",
        boxShadow: `0 4px 12px ${token.colorShadow}`,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text strong>Notifications</Text>
        <Button
          type="link"
          size="small"
          onClick={markAllAsRead}
          style={{ color: "#185FA5", padding: 0 }}
        >
          Tout marquer lu
        </Button>
      </div>

      {/* Connection error banner */}
      {wsError && (
        <div
          style={{
            padding: "6px 16px",
            background: token.colorWarningBg,
            borderBottom: `1px solid ${token.colorWarningBorder}`,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: token.colorWarning,
          }}
        >
          <WifiOutlined />
          Notifications temps réel indisponibles
        </div>
      )}

      {/* Notification list */}
      <List
        dataSource={notifications}
        style={{ maxHeight: "400px", overflowY: "auto" }}
        renderItem={(item) => {
          const dotColor =
            item.wsType
              ? WS_TYPE_COLOR[item.wsType]
              : NOTIF_TYPE_DOT[item.type];

          const icon =
            item.wsType ? WS_TYPE_ICON[item.wsType] : null;

          return (
            <List.Item
              onClick={() => handleNotificationClick(item)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                background: item.read ? "transparent" : token.colorFillSecondary,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                transition: "background 0.2s",
              }}
              className="notification-item"
            >
              <div style={{ display: "flex", width: "100%", alignItems: "flex-start" }}>
                {/* Icon / dot */}
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    backgroundColor: `${dotColor}22`,
                    color: dotColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                    marginRight: 10,
                    flexShrink: 0,
                  }}
                >
                  {icon ?? (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: dotColor,
                        display: "inline-block",
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text strong style={{ fontSize: 13, lineHeight: "1.4" }}>
                      {item.title}
                    </Text>
                  </div>
                  <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}>
                    {item.description}
                  </div>
                  <div style={{ fontSize: 11, color: token.colorTextTertiary, marginTop: 4 }}>
                    {dayjs(item.createdAt).fromNow()}
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
        locale={{
          emptyText: (
            <div style={{ padding: "20px", textAlign: "center", color: token.colorTextTertiary }}>
              Aucune notification
            </div>
          ),
        }}
      />
    </div>
  );

  const bell = (
    <Dropdown
      dropdownRender={() => notificationContent}
      trigger={["click"]}
      placement="bottomRight"
      onOpenChange={(open) => { if (open) markAllAsRead(); }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 10]} style={{ backgroundColor: "#E24B4A" }}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: "20px" }} />}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        />
      </Badge>
    </Dropdown>
  );

  // Wrap with a subtle WS disconnection indicator (dot on the bell icon)
  if (!wsConnected && wsError) {
    return (
      <Tooltip title="Notifications temps réel indisponibles" placement="bottom">
        <span style={{ position: "relative", display: "inline-flex" }}>
          {bell}
          <span
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#EF9F27",
              border: `1.5px solid ${token.colorBgElevated}`,
              pointerEvents: "none",
            }}
          />
        </span>
      </Tooltip>
    );
  }

  return bell;
};

// ─── Header ─────────────────────────────────────────────────────────────────

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({ sticky }) => {
  const { token } = useToken();
  const changeLanguage = useSetLocale();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);

  const currentLocale = "fr";
  const languages = ["fr", "en"];
  const menuItems: MenuProps["items"] = languages.sort().map((lang: string) => ({
    key: lang,
    onClick: () => changeLanguage(lang),
    icon: (
      <span style={{ marginRight: 8 }}>
        <Avatar size={16} src={`/images/flags/${lang}.svg`} />
      </span>
    ),
    label: lang === "fr" ? "Français" : "Anglais",
  }));

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        <Dropdown
          menu={{
            items: menuItems,
            selectedKeys: currentLocale ? [currentLocale] : [],
          }}
        >
          <Button type="text">
            <Space>
              <Avatar size={16} src={`/images/flags/${currentLocale}.svg`} />
              {currentLocale === "fr" ? "Français" : "Anglais"}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        <NotificationBell />
        <Space style={{ marginLeft: "8px" }} size="middle">
          {user?.name && <Text strong>{user.name}</Text>}
          {user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
        </Space>
      </Space>
    </AntdLayout.Header>
  );
};
