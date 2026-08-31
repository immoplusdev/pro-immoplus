import { Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { App as AntdApp } from "antd";
import { useTranslation } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import {
  CalendarOutlined,
  HomeOutlined,
  BookOutlined,
  BuildOutlined,
  UserOutlined,
  WalletOutlined,
  BankOutlined,
  SwapOutlined,
  DollarOutlined,
  SettingOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  BellOutlined,
  HeartOutlined,
  TagOutlined,
  FundOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  SendOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { API_URL, PROJECT_ID } from "@/configs/app.config";
import {
  authProvider,
  getAccessControlProvider,
  getDataProvider,
} from "@/lib/providers";
import { AppRoutes } from "@/AppRoutes";
import { NotificationProvider } from "./contexts/notification-context";
import { ToastManager } from "./components/notifications/toast-manager";

function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <Refine
              dataProvider={getDataProvider(API_URL)}
              notificationProvider={useNotificationProvider}
              authProvider={authProvider}
              i18nProvider={i18nProvider}
              accessControlProvider={getAccessControlProvider()}
              routerProvider={routerBindings}
              resources={[
                {
                  name: "statistics",
                  list: "/statistics",
                  meta: {
                    icon: <BarChartOutlined />,
                    label: "Statistiques",
                  },
                },
                {
                  name: "feed",
                  list: "/feed",
                  show: "/feed/show/:id",
                  meta: {
                    icon: <PlayCircleOutlined />,
                    label: "Feed",
                  },
                },
                {
                  name: "alerts",
                  list: "/alerts",
                  show: "/alerts/show/:id",
                  meta: {
                    icon: <BellOutlined />,
                    label: "Alertes",
                  },
                },
                {
                  name: "demandes-pro-particulier",
                  list: "/demandes-pro-particulier",
                  show: "/demandes-pro-particulier/show/:id",
                  meta: {
                    icon: <SolutionOutlined />,
                    label: "Demandes Pro Particulier",
                  },
                },
                {
                  name: "demandes-visites",
                  list: "/demandes-visites",
                  edit: "/demandes-visites/edit/:id",
                  show: "/demandes-visites/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <CalendarOutlined />,
                    label: "Demandes de visites",
                  },
                },
                {
                  name: "residences",
                  list: "/residences",
                  edit: "/residences/edit/:id",
                  show: "/residences/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <HomeOutlined />,
                    label: "Résidences",
                  },
                },
                {
                  name: "reservations",
                  list: "/reservations",
                  edit: "/reservations/edit/:id",
                  show: "/reservations/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <BookOutlined />,
                    label: "Réservations",
                  },
                },
                {
                  name: "biens-immobiliers",
                  list: "/biens-immobiliers",
                  edit: "/biens-immobiliers/edit/:id",
                  show: "/biens-immobiliers/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <BuildOutlined />,
                    label: "Biens immobiliers",
                  },
                },
                {
                  name: "furnitures",
                  list: "/furnitures",
                  edit: "/furnitures/edit/:id",
                  show: "/furnitures/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <AppstoreOutlined />,
                    label: "Meubles",
                  },
                },
                {
                  name: "users",
                  list: "/users",
                  create: "/users/create",
                  edit: "/users/edit/:id",
                  show: "/users/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <UserOutlined />,
                    label: "Utilisateurs",
                  },
                },
                {
                  name: "wallet-transactions",
                  list: "/wallet/admin/wallet-transactions/:userId",
                  meta: {
                    canDelete: true,
                    icon: <WalletOutlined />,
                  },
                },
                {
                  name: "wallets",
                  list: "/wallet/:userId",
                  create: "/users/create",
                  edit: "/wallet/:userId",
                  show: "/users/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <WalletOutlined />,
                  },
                },
                {
                  name: "withdrawal-requests",
                  list: "/withdrawal-requests",
                  create: "/withdrawal-requests/create",
                  edit: "/withdrawal-requests/edit/:id",
                  show: "/withdrawal-requests/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <BankOutlined />,
                    label: "Demandes de retraits",
                  },
                },
                {
                  name: "transfers",
                  list: "/transfers",
                  create: "/transfers/create",
                  edit: "/transfers/edit/:id",
                  show: "/transfers/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <SwapOutlined />,
                    label: "Transferts",
                  },
                },
                {
                  name: "payments",
                  list: "/payments",
                  meta: {
                    icon: <DollarOutlined />,
                    label: "Paiements",
                  },
                },
                {
                  name: "user-preferences",
                  list: "/user-preferences",
                  meta: {
                    icon: <HeartOutlined />,
                    label: "Préférences utilisateurs",
                  },
                },
                {
                  name: "banners",
                  list: "/banners",
                  create: "/banners/new",
                  edit: "/banners/:id/edit",
                  meta: {
                    icon: <TagOutlined />,
                    label: "Bannières",
                  },
                },
                {
                  name: "ads/campaigns",
                  list: "/ads/campaigns",
                  create: "/ads/campaigns/create",
                  edit: "/ads/campaigns/edit/:id",
                  show: "/ads/campaigns/show/:id",
                  meta: {
                    canDelete: true,
                    icon: <FundOutlined />,
                    label: "Campagnes pub",
                  },
                },
                {
                  name: "admin/pro-certification",
                  list: "/admin/pro-certification",
                  show: "/admin/pro-certification/:id",
                  meta: {
                    icon: <SafetyCertificateOutlined />,
                    label: "Certification Pro",
                  },
                },
                {
                  name: "admin/clients-statistiques",
                  list: "/admin/clients-statistiques",
                  show: "/admin/clients-statistiques/:clientId",
                  meta: {
                    icon: <TeamOutlined />,
                    label: "Statistiques Clients",
                  },
                },
                {
                  name: "admin/campaigns",
                  list: "/admin/campaigns",
                  create: "/admin/campaigns/create",
                  show: "/admin/campaigns/:campagneId",
                  meta: {
                    icon: <SendOutlined />,
                    label: "Campagnes Push/WhatsApp",
                  },
                },
                {
                  name: "admin/campaign-tags",
                  list: "/admin/campaign-tags",
                  meta: {
                    icon: <TagsOutlined />,
                    label: "Tags de campagne",
                  },
                },
                {
                  name: "configs",
                  list: "/configs",
                  meta: {
                    icon: <SettingOutlined />,
                    label: "Configurations",
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: PROJECT_ID,
              }}
            >
              <NotificationProvider>
                <AppRoutes />
                <ToastManager />
              </NotificationProvider>
              {/*<RefineKbar/>*/}
              {/*<UnsavedChangesNotifier/>*/}
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
