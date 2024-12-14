import type {CrudFilters} from "@refinedev/core";

export function generateSearch(filters?: CrudFilters) {
    if (filters) {
        const searchFilter = filters.find((filter) => (filter as Record<string, any>).field === "q");
        console.log(filters)
        if (searchFilter) return searchFilter.value;
    }
    return null;
}
