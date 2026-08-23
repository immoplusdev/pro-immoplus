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

/**
 * Handles the two error payload shapes returned by the API:
 * - business errors (404, JWT): { message: string, errors: string[], ... }
 * - validation/permission errors (400, 403): { message: string | string[] }
 */
export function extractErrorMessage(err: any, fallbackMessage?: string): string {
    const data = err?.response?.data ?? err?.data;

    if (data) {
        if (Array.isArray(data.message) && data.message.length > 0) return data.message.join(", ");
        if (typeof data.message === "string" && data.message) return data.message;
        if (Array.isArray(data.errors) && data.errors.length > 0) {
            const first = data.errors[0];
            if (typeof first === "string") return first;
            if (first?.message) return first.message;
        }
    }

    return fallbackMessage ?? "Nous avons rencontré une erreur inattendue lors de l'opération";
}