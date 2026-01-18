import {API_URL} from "@/configs/app.config";
import {httpExceptionToMessage} from "@/lib/helpers";
import axios, {AxiosError} from "axios";
import {axiosInstance, setRefreshTokenHandler} from "@/lib/providers/utils";
import {AuthService} from "@/core/domain/auth";
import {User, UserRole} from "@/core/domain/users";
import {getLocalStorageProvider} from "@/lib/providers/local-storage.provider";


const authStorageManager = getLocalStorageProvider();

export const authService: AuthService = {
    async login(username: string, password: string) {
        const body = {
            username,
            password,
            source: "admin_app"
        }

        try {
            const response = await axios.post(`${API_URL}/auth/login`, body);


            const {accessToken, refreshToken, expires, user} = response.data.data;

            const role = user?.role?.id;
            const allowedRoles = ["admin", "financier", "commercial"];
            if (!allowedRoles.includes(role)) throw new Error();

            const authData = {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires,
                expires_at: expires,
                message: undefined,
                role
            };


            this.setUserToken(authData.access_token);
            authStorageManager.setAuthData(authData);

            return authData;
        } catch (error) {
            let message = "Mauvais non d'utilisateur ou mot de passe";
            const exception = error as AxiosError;
            if (exception.status != 401 && exception.status != 403 && exception.status != 400) message = httpExceptionToMessage(error, message)
            return {message, access_token: null}
        }
    },

    async refreshToken() {
        try {
            const authData = authStorageManager.getAuthData();
            if (!authData || !authData.refresh_token) {
                return null;
            }

            const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                refreshToken: authData.refresh_token
            });

            const {accessToken, refreshToken, expires} = response.data.data;

            const newAuthData = {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires,
                expires_at: expires,
                role: authData.role
            };

            this.setUserToken(newAuthData.access_token);
            authStorageManager.setAuthData(newAuthData);

            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires
            };
        } catch (error) {
            console.error("Failed to refresh token:", error);
            await this.logout();
            return null;
        }
    },

    getToken() {
        const token = authStorageManager.getAuthData();
        if (token && token.access_token) {
            this.setUserToken(token.access_token);
            return true;
        }
        return false;
    },

    async logout() {
        authStorageManager.setAuthData(null);
    },

    setUserToken(token: string) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },

    async getUserData() {
        try {
            const token = authStorageManager.getAuthData();
            if (!token) return null;

            const response = await axiosInstance.get(`${API_URL}/users/data/me`);

            return response.data.data;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    getUserRole(user: Partial<User>): UserRole {
        return user?.role?.id as UserRole;
    },

    isUserAdmin(user: Partial<User>): boolean {
        return this.getUserRole(user) === UserRole.Admin;
    },

    canAccessResource(user: Partial<User>, resource: string, action: string): boolean {
        return true;
    }
}

// Configure refresh token handler for axios interceptor
setRefreshTokenHandler(() => authService.refreshToken());
