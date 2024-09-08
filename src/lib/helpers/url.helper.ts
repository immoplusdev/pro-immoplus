import { API_URL } from "@/configs/app.config";
import queryString from "query-string";

export function getImageUrl(imageId: string) {
    return `${API_URL}/files/raw/public/${imageId}`
}

export function getApiFileUrl(imageId: string) {
    return `${API_URL}/files/raw/public/${imageId}`
}

export function serializeWhereParameterToQueryFiltersString(where: Record<string, any>[]): string {

    const query = where.map(filter => {
        const filterParams = filter._field;
        const queryParams: Record<string, any> = {};
        if(filterParams.field) queryParams['_field'] = filterParams.field;
        if(filterParams.operator) queryParams['_operator'] = filterParams.operator;
        if(filterParams.value) queryParams['_val'] = filterParams.value;
        return `_where=${JSON.stringify(queryParams)}`;
    }).join('&');

    console.log(query);

    return query;
}