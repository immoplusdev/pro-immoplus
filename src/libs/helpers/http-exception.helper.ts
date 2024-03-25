/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";

export function httpExceptionToMessage(error: any, fallbackMessage?: string) {
    return httpResponseToMessage(error.response, fallbackMessage)
}

export function httpResponseToMessage(response: AxiosResponse, fallbackMessage?: string) {
    if (response?.data) {
        if (response?.data?.message) return response.data.message
        if (response?.data?.errors && response?.data?.errors[0] && response?.data?.errors[0].message) return response.data.errors[0].message;
    }
    return fallbackMessage ?? "Nous avons rencontré une erreur inattendue lors de l'opération";
}