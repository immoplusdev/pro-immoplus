import type {CrudFilters} from "@refinedev/core";
import queryString from "query-string";

/**
 * Filtres `eq` refine -> query string simple (`?actor=CLIENT&includeInactive=true`),
 * pour les endpoints qui n'acceptent pas le format `_where`. Les autres opérateurs sont ignorés.
 */
export const generatePlainQuery = (filters?: CrudFilters): string => {
    const params: Record<string, string | number | boolean> = {};

    filters?.forEach((filter) => {
        if (!("field" in filter) || filter.operator !== "eq") return;
        const {field, value} = filter;
        if (value === undefined || value === null || value === "") return;
        params[field] = value;
    });

    return queryString.stringify(params);
};
