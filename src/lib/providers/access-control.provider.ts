import {AccessControlProvider} from "@refinedev/core";
import {authService} from "@/lib/services/auth";
import {getLocalStorageProvider} from "./local-storage.provider";

const localStorageProvider = getLocalStorageProvider();

export const getAccessControlProvider: () => AccessControlProvider = () => (
    {
        can: async ({resource, action, params}) => {
            // const sessionData = localStorageProvider.getAuthData();
            // console.log(action)
            // if (!sessionData || !sessionData.role) return {can: false};
            // const can = authService.canAccessResource({role: sessionData.role}, resource as string, action);
            return {can: true};
        },
        options: {
            buttons: {
                enableAccessControl: true,
                hideIfUnauthorized: true,
            },
        },
    })
