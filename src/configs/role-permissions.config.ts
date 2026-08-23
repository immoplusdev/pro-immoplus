import { UserRole } from "@/core/domain/users";

export interface RolePermission {
    resources: string[];
    defaultRedirect: string;
}

export const rolePermissions: Record<string, RolePermission> = {
    [UserRole.Admin]: {
        resources: [
            "statistics",
            "alerts",
            "demandes-pro-particulier",
            "demandes-visites",
            "residences",
            "reservations",
            "biens-immobiliers",
            "furnitures",
            "users",
            "user-preferences",
            "wallet-transactions",
            "wallets",
            "withdrawal-requests",
            "transfers",
            "payments",
            "feed",
            "banners",
            "ads/campaigns",
            "admin/pro-certification",
            "admin/clients-statistiques",
            "configs",
        ],
        defaultRedirect: "/demandes-visites",
    },
    [UserRole.Financier]: {
        resources: [
            "withdrawal-requests",
            "transfers",
            "payments",
        ],
        defaultRedirect: "/withdrawal-requests",
    },
    [UserRole.Commercial]: {
        resources: [
            "statistics",
            "alerts",
            "demandes-pro-particulier",
            "demandes-visites",
            "residences",
            "reservations",
            "biens-immobiliers",
            "furnitures",
            "users",
            "user-preferences",
            "feed",
            "ads/campaigns",
        ],
        defaultRedirect: "/demandes-visites",
    },
};

export const canAccessResource = (role: string, resource: string): boolean => {
    const permissions = rolePermissions[role];
    if (!permissions) return false;
    return permissions.resources.includes(resource);
};

export const getDefaultRedirect = (role: string): string => {
    const permissions = rolePermissions[role];
    return permissions?.defaultRedirect || "/";
};

export const getAllowedResources = (role: string): string[] => {
    const permissions = rolePermissions[role];
    return permissions?.resources || [];
};
