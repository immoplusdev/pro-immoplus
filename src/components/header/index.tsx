import { BellOutlined, DownOutlined, CheckCircleFilled } from "@ant-design/icons";
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
  theme,
  Typography,
} from "antd";
import React, { useContext } from "react";
import {ColorModeContext} from "@/contexts/color-mode";
import { useNotifications } from "@/contexts/notification-context";
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

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky,
}) => {
  const { token } = useToken();
  // const { i18n } = useTranslation();
  // const locale = useGetLocale();
  const changeLanguage = useSetLocale();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);

  const currentLocale = "fr"//locale();
  const languages = ["fr", "en"];
  // [...(i18n.languages || [])]
  const menuItems: MenuProps["items"] = languages
    .sort()
    .map((lang: string) => ({
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

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id);
    if (n.reservationId) {
      navigate(`/reservations/edit/${n.reservationId}`);
    }
  };

  const notificationContent = (
    <div style={{ 
      width: "320px", 
      background: "white", 
      borderRadius: "8px", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      overflow: "hidden" 
    }}>
      <div style={{ 
        padding: "12px 16px", 
        borderBottom: "1px solid #f0f0f0", 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center"
      }}>
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
      <List
        dataSource={notifications}
        style={{ maxHeight: "400px", overflowY: "auto" }}
        renderItem={(item) => (
          <List.Item 
            onClick={() => handleNotificationClick(item)}
            style={{ 
              padding: "12px 16px", 
              cursor: "pointer",
              background: item.read ? "transparent" : "#f5f5f5",
              borderBottom: "1px solid #f0f0f0",
              transition: "background 0.2s"
            }}
            className="notification-item"
          >
            <div style={{ display: "flex", width: "100%", alignItems: "flex-start" }}>
              <div style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%", 
                backgroundColor: item.type === 'urgent' ? '#E24B4A' : (item.type === 'warning' ? '#EF9F27' : '#5DCAA5'),
                marginTop: "6px",
                marginRight: "10px",
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ fontSize: "13px", lineHeight: "1.4" }}>{item.title}</Text>
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{item.description}</div>
                <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
                   {dayjs(item.createdAt).fromNow()}
                </div>
              </div>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>Aucune notification</div> }}
      />
    </div>
  );

  return (
    <Dropdown dropdownRender={() => notificationContent} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} size="small" offset={[-2, 10]} style={{ backgroundColor: "#E24B4A" }}>
        <Button 
          type="text" 
          icon={<BellOutlined style={{ fontSize: "20px" }} />} 
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        />
      </Badge>
    </Dropdown>
  );
};

