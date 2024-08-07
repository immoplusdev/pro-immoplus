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
import dataProvider from "@/lib/providers/data-provider";
import authProvider from "@/lib/providers/auth-provider";
import {API_URL, PROJECT_ID, PROJECT_NAME} from "@/configs/app.config";
import accessControlProvider from "@/lib/providers/access-control-provider";
import {CreateResidence, EditResidence, ListResidences, ShowResidence} from "@/pages/residences";


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
                                dataProvider={dataProvider(API_URL)}
                                notificationProvider={useNotificationProvider}
                                authProvider={authProvider}
                                i18nProvider={i18nProvider}
                                accessControlProvider={accessControlProvider}
                                routerProvider={routerBindings}
                                resources={[
                                    {
                                    name: "residences",
                                        list: "/residences",
                                        create: "/residences/create",
                                        edit: "/residences/edit/:id",
                                        show: "/residences/show/:id",
                                        meta: {
                                            canDelete: true,
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
                                <Routes>
                                    <Route
                                        element={
                                            <Authenticated
                                                key="authenticated-inner"
                                                fallback={<CatchAllNavigate to={"/login"}/>}
                                            >
                                                <ThemedLayoutV2
                                                    Header={() => <Header sticky/>}
                                                    Sider={(props) => <ThemedSiderV2 {...props}  fixed/>}
                                                    Title={({collapsed}) => (
                                                        <ThemedTitleV2
                                                            collapsed={collapsed}
                                                            text={""}
                                                            icon={<AppIcon/>}
                                                        />
                                                    )}
                                                >
                                                    <Outlet/>
                                                </ThemedLayoutV2>
                                            </Authenticated>
                                        }
                                    >
                                        <Route
                                            index
                                            element={<NavigateToResource resource="blog_posts"/>}
                                        />
                                        <Route path={"/residences"}>
                                            <Route index element={<ListResidences/>}/>
                                            <Route path="create" element={<CreateResidence/>}/>
                                            <Route path="edit/:id" element={<EditResidence/>}/>
                                            <Route path="show/:id" element={<ShowResidence/>}/>
                                        </Route>
                                        <Route path="*" element={<ErrorComponent/>}/>
                                    </Route>
                                    <Route>
                                        <Route path={"/login"} element={<Login/>}/>
                                        {/*<Route path={"/register"} element={<Register />} />*/}
                                        <Route
                                            path={"/forgot-password"}
                                            element={<ForgotPassword/>}
                                        />
                                    </Route>
                                </Routes>

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
