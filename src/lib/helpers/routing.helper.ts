import { ROUTE_PREFIX } from "@/configs/app.config";


export function getRoutePath(route: string){
    // return `${ROUTE_PREFIX}${route}`
    return route;
}
export function getAuthRoutePath(route: string){
    return `${ROUTE_PREFIX}${route}`
}