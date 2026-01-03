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
import { ColorModeContextProvider } from "./contexts/color-mode";
import { API_URL, PROJECT_ID } from "@/configs/app.config";
import {
  authProvider,
  getAccessControlProvider,
  getDataProvider,
} from "@/lib/providers";
import { AppRoutes } from "@/AppRoutes";

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
                  name: "demandes-visites",
                  list: "/demandes-visites",
                  edit: "/demandes-visites/edit/:id",
                  show: "/demandes-visites/show/:id",
                  meta: {
                    canDelete: true,
                  },
                },
                {
                  name: "residences",
                  list: "/residences",
                  // create: "/residences/create",
                  edit: "/residences/edit/:id",
                  show: "/residences/show/:id",
                  meta: {
                    canDelete: true,
                  },
                },
                {
                  name: "reservations",
                  list: "/reservations",
                  // create: "/reservations/create",
                  edit: "/reservations/edit/:id",
                  show: "/reservations/show/:id",
                  meta: {
                    canDelete: true,
                  },
                },
                {
                  name: "biens-immobiliers",
                  list: "/biens-immobiliers",
                  edit: "/biens-immobiliers/edit/:id",
                  show: "/biens-immobiliers/show/:id",
                  meta: {
                    canDelete: true,
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
                    label: "Utilisateurs",
                  },
                },
                {
                  name: "wallet-transactions",
                  list: "/wallet/admin/wallet-transactions/:userId",
                  meta: {
                    canDelete: true,
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
                    label: "Demande de retraits",
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
                    label: "Transferts",
                  },
                },
                {
                  name: "payments",
                  list: "/payments",
                  meta: {
                    label: "Paiements",
                  }
                },
                {
                  name: "configs",
                  list: "/configs",
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: PROJECT_ID,
              }}
            >
              <AppRoutes />
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
