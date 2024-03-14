import { API_URL } from "@/config/app.config";
import { httpExceptionToMessage } from "@/libs/helpers/http-exception.helper";
import { authLocalStorage } from "@/libs/providers/directusClient";
import axios, { AxiosError } from "axios";

export class AuthService {
    async login(username: string, password: string) {
        console.log(username)
        const body = {
            username,
            password
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, body);
            const { access_token, refresh_token, expires, expires_at } = response.data.data;
            const authData = { access_token, refresh_token, expires, expires_at, message: undefined };
            const authStorageManager = authLocalStorage();
            await authStorageManager.set(authData)
            return authData;
        } catch (error) {
            let message = "Mauvais non d'utilisateur ou mot de passe";
            const exception = error as AxiosError;
            if (exception.status != 401 && exception.status != 403 && exception.status != 400) message = httpExceptionToMessage(error, message)
            return { message, access_token: null }
        }
    }
} 