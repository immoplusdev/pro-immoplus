import { API_URL } from "@/configs/app.config";
import queryString from "query-string";

export function getImageUrl(imageId: string) {
    const baseUrl = API_URL.replace(/^http:/, 'https:');
    return `${baseUrl}/files/raw/public/${imageId}`
}

export function getCarouselUrls(miniatureId: string, images?:[]){
    const imagesUrls: string[] = [];
    
    if (miniatureId) {
        imagesUrls.push(miniatureId);
    }
    
    return images ? imagesUrls.concat(images) : imagesUrls;
}

export function getApiFileUrl(imageId: string) {
    const baseUrl = API_URL.replace(/^http:/, 'https:');
    return `${baseUrl}/files/raw/public/${imageId}`
}

export function serializeWhereParameterToQueryFiltersString(where: Record<string, any>[]): string {
    if (where.length === 0) return "";
    return where
        .map(filter => `_where=${encodeURIComponent(JSON.stringify(filter))}`)
        .join('&');
}
