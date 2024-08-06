import {API_URL} from "@/configs/app.config";
import {httpExceptionToMessage} from "@/lib/helpers";
import axios, {AxiosError} from "axios";
import {localStorageProvider} from "@/lib/providers";
import {axiosInstance} from "@/lib/providers/utils";

export class AuthService {
    async login(username: string, password: string) {
        const body = {
            username,
            password
        }

        try {
            const response = await axios.post(`${API_URL}/auth/login`, body);
            const {accessToken, refreshToken, expires} = response.data.data;

            const authData = {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires,
                expires_at: expires,
                message: undefined
            };

            const authStorageManager = localStorageProvider();

            this.setUserToken(authData.access_token);
            authStorageManager.setAuthData(authData);

            return authData;
        } catch (error) {
            console.log(error)
            let message = "Mauvais non d'utilisateur ou mot de passe";
            const exception = error as AxiosError;
            if (exception.status != 401 && exception.status != 403 && exception.status != 400) message = httpExceptionToMessage(error, message)
            return {message, access_token: null}
        }
    }

    getToken() {
        const authStorageManager = localStorageProvider();
        const token = authStorageManager.getAuthData();
        if (token && token.access_token) {
            this.setUserToken(token.access_token);
            return true;
        }
        return false;
    }

    async logout() {
        const authStorageManager = localStorageProvider();
        await authStorageManager.setAuthData(null);
    }

    private setUserToken(token: string) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    async getUserData() {
        try {
            const authStorageManager = localStorageProvider();
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
    }
}