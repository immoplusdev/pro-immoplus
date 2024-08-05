import { API_URL } from "@/configs/app.config";
import { httpExceptionToMessage } from "@/lib/helpers/http-exception.helper";
import { authLocalStorage } from "@/lib/providers/directus-client";
import axios, { AxiosError } from "axios";

export class AuthService {
    async login(username: string, password: string) {
        const body = {
            username,
            password
        }

        try {
            const response = await axios.post(`${API_URL}/auth/login`, body);
            const { accessToken, refreshToken, expires } = response.data.data;

            const authData = { access_token: accessToken, refresh_token: refreshToken, expires, expires_at: expires, message: undefined };
            const authStorageManager = authLocalStorage();

            await authStorageManager.set(authData)
            return authData;
        } catch (error) {
            console.log(error)
            let message = "Mauvais non d'utilisateur ou mot de passe";
            const exception = error as AxiosError;
            if (exception.status != 401 && exception.status != 403 && exception.status != 400) message = httpExceptionToMessage(error, message)
            return { message, access_token: null }
        }
    }
} 