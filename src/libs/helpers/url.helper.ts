import { API_URL } from "@/config/app.config";

export function getImageUrl(imageId: string) {
    return `${API_URL}/api/file/${imageId}`
}