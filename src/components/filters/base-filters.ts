import {CrudFilter} from "@refinedev/core/src/contexts/data/types";

export function getBaseFilters(params: any): CrudFilter[] {
    return [
        {
            field: "q",
            operator: "eq",
            value: params.q,
        },
        {
            field: "createdAt",
            operator: "gte",
            value: params?.createdAt ? params?.createdAt[0].toISOString() : undefined,
        },
        {
            field: "createdAt",
            operator: "lte",
            value: params?.createdAt ? params?.createdAt[1].toISOString() : undefined,
        }
    ]
}
