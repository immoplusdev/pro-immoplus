import {API_URL} from "@/configs/app.config";
import {httpExceptionToMessage} from "@/lib/helpers";
import axios, {AxiosError} from "axios";
import {axiosInstance} from "@/lib/providers/utils";
import {AuthService} from "@/core/domain/auth";
import {User, UserRole} from "@/core/domain/users";
import {getLocalStorageProvider} from "@/lib/providers/local-storage.provider";


const authStorageManager = getLocalStorageProvider();

export const authService: AuthService = {
    async login(username: string, password: string) {
        const body = {
            username,
            password
        }

        try {
            const response = await axios.post(`${API_URL}/auth/login`, body);


            const {accessToken, refreshToken, expires, user} = response.data.data;

            const role = user?.role?.id;
            if (role != "admin") throw new Error();

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

    getToken() {
        const token = authStorageManager.getAuthData();
        if (token && token.access_token) {
            this.setUserToken(token.access_token);
            return true;
        }
        return false;
    },

    async logout() {
        await authStorageManager.setAuthData(null);
    },

    setUserToken(token: string) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },

    async getUserData() {
        try {
            const token = await authStorageManager.getAuthData();
            if (!token) return null;

            const response = await axios.get(`${API_URL}/users/data/me`, {
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            });

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
