import { API_URL } from "@/configs/app.config";

export function getImageUrl(imageId: string) {
    return `${API_URL}/api/file/${imageId}`
}

export function getApiFileUrl(imageId: string) {
    return `${API_URL}/api/file/${imageId}`
}