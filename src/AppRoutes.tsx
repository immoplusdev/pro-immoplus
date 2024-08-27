import {Outlet, Route, Routes} from "react-router-dom";
import {Authenticated} from "@refinedev/core";
import {CatchAllNavigate, NavigateToResource} from "@refinedev/react-router-v6";
import {ErrorComponent, ThemedLayoutV2, ThemedSiderV2, ThemedTitleV2} from "@refinedev/antd";
import {AppIcon, Header} from "@/components";
import {ListResidences, ShowResidence} from "@/pages/residences";
import { EditReservation, ListReservations, ShowReservation} from "@/pages/reservations";
import {EditConfig} from "@/pages/configs/edit-config";
import {Login} from "@/pages/auth";
import {ForgotPassword} from "@/pages/forgotPassword";

export function AppRoutes(){
    return (
        <Routes>
            <Route
                element={
                    <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to={"/login"}/>}
                    >
                        <ThemedLayoutV2
                            Header={() => <Header sticky/>}
                            Sider={(props) => <ThemedSiderV2 {...props} fixed/>}
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
                    element={<NavigateToResource resource="residences"/>}
                />
                <Route path={"/residences"}>
                    <Route index element={<ListResidences/>}/>
                    {/*<Route path="create" element={<CreateResidence/>}/>*/}
                    {/*<Route path="edit/:id" element={<EditResidence/>}/>*/}
                    <Route path="show/:id" element={<ShowResidence/>}/>
                </Route>
                <Route path={"/reservations"}>
                    <Route index element={<ListReservations/>}/>
                    {/*<Route path="create" element={<CreateReservation/>}/>*/}
                    <Route path="edit/:id" element={<EditReservation/>}/>
                    <Route path="show/:id" element={<ShowReservation/>}/>
                </Route>
                <Route path={"/configs"}>
                    <Route index element={<EditConfig/>}/>
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

    )
}