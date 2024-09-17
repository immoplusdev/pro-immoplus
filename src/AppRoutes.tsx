import {Outlet, Route, Routes} from "react-router-dom";
import {Authenticated} from "@refinedev/core";
import {CatchAllNavigate, NavigateToResource} from "@refinedev/react-router-v6";
import {ErrorComponent, ThemedLayoutV2, ThemedSiderV2, ThemedTitleV2} from "@refinedev/antd";
import {AppIcon, Header} from "@/components";
import {EditResidence, ListResidences, ShowResidence} from "@/pages/residences";
import { EditReservation, ListReservations, ShowReservation} from "@/pages/reservations";
import {Login} from "@/pages/auth";
import {ForgotPassword} from "@/pages/forgotPassword";
import {ListResidencesEnValidation} from "./pages/residences/list-residences-en-validation";
import {
    EditBienImmobilier,
    ListBienImmobiliers,
    ShowBienImmobilier
} from "@/pages/biens-immobiliers";
import {CreateUser, EditUser, ListUsers, ShowUser} from "@/pages/users";
import {ListUsersProEntreprise} from "@/pages/users/list-users-pro-entreprise";
import {ListUsersProParticulier} from "@/pages/users/list-users-pro-particulier";
import {ListUsersValides} from "@/pages/users/list-users-valides";
import {ListUsersNonValides} from "@/pages/users/list-users-non-valides";
import {ListUsersCustomers} from "@/pages/users/list-users-customers";
import {ListResidencesValides} from "@/pages/residences/list-residences-valides";
import {ShowConfig} from "@/pages/configs";

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
                    <Route path="edit/:id" element={<EditResidence/>}/>
                    <Route path="show/:id" element={<ShowResidence/>}/>
                    <Route path="en-validation" element={<ListResidencesEnValidation/>}/>
                    <Route path="validé" element={<ListResidencesValides/>}/>
                </Route>
                <Route path={"/reservations"}>
                    <Route index element={<ListReservations/>}/>
                    {/*<Route path="create" element={<CreateReservation/>}/>*/}
                    <Route path="edit/:id" element={<EditReservation/>}/>
                    <Route path="show/:id" element={<ShowReservation/>}/>
                </Route>
                <Route path={"/biens-immobiliers"}>
                    <Route index element={<ListBienImmobiliers/>}/>
                    <Route path="edit/:id" element={<EditBienImmobilier/>}/>
                    <Route path="show/:id" element={<ShowBienImmobilier/>}/>
                </Route>
                <Route path={"/users"}>
                    <Route index element={<ListUsers/>}/>
                    <Route path="pro-entreprise" element={<ListUsersProEntreprise/>}/>
                    <Route path="pro-particulier" element={<ListUsersProParticulier/>}/>
                    <Route path="utilisateurs-valides" element={<ListUsersValides/>}/>
                    <Route path="utilisateurs-non-valides" element={<ListUsersNonValides/>}/>
                    <Route path="customer" element={<ListUsersCustomers/>}/>
                    <Route path="create" element={<CreateUser/>}/>
                    <Route path="edit/:id" element={<EditUser/>}/>
                    <Route path="show/:id" element={<ShowUser/>}/>
                </Route>
                <Route path={"/configs"}>
                    <Route index element={<ShowConfig/>}/>
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