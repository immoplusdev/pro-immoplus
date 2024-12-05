import type {CrudFilters} from "@refinedev/core";

export function generateSearch(filters?: CrudFilters) {
    if (filters) {
        const searchFilter = filters.find((filter) => (filter as Record<string, any>).field === "q");
        if (searchFilter) return searchFilter.value;
    }
    return null;
}
