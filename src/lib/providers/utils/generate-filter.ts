import type {CrudFilters} from "@refinedev/core";
import {ItemsParamsCriterias} from "@/lib/providers/utils";


export const generateFilter = (filters?: CrudFilters) => {
    const queryFilters: Partial<ItemsParamsCriterias>[] = [];

    if (filters) {
        filters.forEach((filter) => {

            if (filter.operator === "or" || filter.operator === "and") {
                throw new Error(
                    `[@refinedev/simple-rest]: \`operator: ${filter.operator}\` is not supported. You can create custom data provider. https://refine.dev/docs/api-reference/core/providers/data-provider/#creating-a-data-provider`,
                );
            }

            if ((filter as Record<string, any>).field) {
                const field = (filter as any).field;
                if (field == "q") return;
                const queryFilter: Partial<ItemsParamsCriterias> = {
                    _field: field,
                    _op: filter.operator as never,
                    _val: filter.value,
                }
                queryFilters.push(queryFilter);
            }
        });
    }

    console.log(queryFilters)
    return queryFilters;
};
