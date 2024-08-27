import {Authenticated, Refine, useGetIdentity} from "@refinedev/core";
import {DevtoolsPanel, DevtoolsProvider} from "@refinedev/devtools";
import {RefineKbar, RefineKbarProvider} from "@refinedev/kbar";
import {
    ErrorComponent,
    ThemedLayoutV2,
    ThemedSiderV2,
    ThemedTitleV2,
    useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
    CatchAllNavigate,
    DocumentTitleHandler,
    NavigateToResource,
    UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import {App as AntdApp} from "antd";
import {useTranslation} from "react-i18next";
import {BrowserRouter, Outlet, Route, Routes} from "react-router-dom";
import {AppIcon, Header} from "./components";
import {ColorModeContextProvider} from "./contexts/color-mode";
import {ForgotPassword} from "./pages/forgotPassword";
import {Login} from "./pages/auth/login";
import {API_URL, PROJECT_ID} from "@/configs/app.config";
import {ListResidences, ShowResidence} from "@/pages/residences";
import {EditConfig} from "@/pages/configs/edit-config";
import {authProvider, getAccessControlProvider, getDataProvider} from "@/lib/providers";
import {CreateReservation, EditReservation, ListReservations, ShowReservation} from "@/pages/reservations";
import {AppRoutes} from "@/AppRoutes";


function App() {
    const {t, i18n} = useTranslation();

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
                        <DevtoolsProvider>
                            <Refine
                                dataProvider={getDataProvider(API_URL)}
                                notificationProvider={useNotificationProvider}
                                authProvider={authProvider}
                                i18nProvider={i18nProvider}
                                accessControlProvider={getAccessControlProvider()}
                                routerProvider={routerBindings}
                                resources={[
                                    {
                                        name: "residences",
                                        list: "/residences",
                                        // create: "/residences/create",
                                        // edit: "/residences/edit/:id",
                                        show: "/residences/show/:id",
                                        meta: {
                                            canDelete: true,

                                        },
                                    },
                                    {
                                        name: "reservations",
                                        list: "/reservations",
                                        create: "/reservations/create",
                                        edit: "/reservations/edit/:id",
                                        show: "/reservations/show/:id",
                                        meta: {
                                            canDelete: true,
                                        },
                                    },
                                    {
                                        name: "configs",
                                        list: "/configs"
                                    },
                                ]}
                                options={{
                                    syncWithLocation: true,
                                    warnWhenUnsavedChanges: true,
                                    useNewQueryKeys: true,
                                    projectId: PROJECT_ID,
                                }}
                            >
                                <AppRoutes/>
                                <RefineKbar/>
                                <UnsavedChangesNotifier/>
                                <DocumentTitleHandler/>
                            </Refine>
                            <DevtoolsPanel/>
                        </DevtoolsProvider>
                    </AntdApp>
                </ColorModeContextProvider>
            </RefineKbarProvider>
        </BrowserRouter>
    );
}

export default App;
