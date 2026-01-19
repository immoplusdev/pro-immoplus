import {AccessControlProvider} from "@refinedev/core";
import {getLocalStorageProvider} from "./local-storage.provider";
import {canAccessResource} from "@/configs/role-permissions.config";

const localStorageProvider = getLocalStorageProvider();

export const getAccessControlProvider: () => AccessControlProvider = () => (
    {
        can: async ({resource, action, params}) => {
            const sessionData = localStorageProvider.getAuthData();

            if (!sessionData || !sessionData.role) {
                return {can: false, reason: "Not authenticated"};
            }

            const role = sessionData.role;
            const can = canAccessResource(role, resource as string);

            return {
                can,
                reason: can ? undefined : "You don't have permission to access this resource",
            };
        },
        options: {
            buttons: {
                enableAccessControl: true,
                hideIfUnauthorized: true,
            },
        },
    })
