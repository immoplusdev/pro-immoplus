import { UserRole } from "@/core/domain/users";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";

const localStorageProvider = getLocalStorageProvider();

/** Rôle de l'utilisateur connecté === Admin (même source que l'access control et le menu). */
export function isAdminViewer(): boolean {
    return localStorageProvider.getAuthData()?.role === UserRole.Admin;
}
