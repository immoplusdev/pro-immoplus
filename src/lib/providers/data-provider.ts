import type {AxiosInstance} from "axios";
import type {DataProvider} from "@refinedev/core";
import {axiosInstance, generateSort, generateFilter} from "./utils";
import queryString from "query-string";

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";


export const dataProvider = (
    apiUrl: string,
    httpClient: AxiosInstance = axiosInstance,
): Omit<
    Required<DataProvider>,
    "createMany" | "updateMany" | "deleteMany"
> => {
    return {
        getList: async ({resource, pagination, filters, sorters, meta}) => {

            const url = `${apiUrl}/${resource}`;

            const {current = 1, pageSize = 10, mode = "server"} = pagination ?? {};

            const {headers: headersFromMeta, method} = meta ?? {};

            const requestMethod = (method as MethodTypes) ?? "get";

            const queryFilters = generateFilter(filters);

            const query: {
                _page?: number;
                _pageSize?: number;
                _order_by?: string;
                _order_dir?: string;
                _select?: string[];
            } = {};

            if (mode === "server") {
                query._page = current;
                query._pageSize = pageSize;
            }

            const generatedSort = generateSort(sorters);
            if (generatedSort) {
                const {_sort, _order} = generatedSort;
                query._order_by = _sort.join(",").at(0);
                query._order_dir = _order.join(",").at(0);
            }

            const combinedQuery = {...query, ...queryFilters};
            const urlWithQuery = Object.keys(combinedQuery).length
                ? `${url}?${queryString.stringify(combinedQuery)}`
                : url;

            const {data} = await httpClient[requestMethod](urlWithQuery, {
                headers: headersFromMeta,
            });

            const total = data.totalCount

            return {
                data: data.data,
                total: total || data.data.length,
            };
        },

        getMany: async ({resource, ids, meta}) => {
            const {headers, method} = meta ?? {};
            const requestMethod = (method as MethodTypes) ?? "get";

            const {data} = await httpClient[requestMethod](
                `${apiUrl}/${resource}?_where=${queryString.stringify([{_field: "id", "_op": "in", _val: ids}])}`,
                {headers},
            );

            return {
                data: data.data,
            };
        },

        create: async ({resource, variables, meta}) => {
            const url = `${apiUrl}/${resource}`;

            const {headers, method} = meta ?? {};
            const requestMethod = (method as MethodTypesWithBody) ?? "post";

            const {data} = await httpClient[requestMethod](url, variables, {
                headers,
            });

            return {
                data: data.data,
            };
        },

        update: async ({resource, id, variables, meta}) => {
            const url = `${apiUrl}/${resource}/${id}`;

            const {headers, method} = meta ?? {};
            const requestMethod = (method as MethodTypesWithBody) ?? "patch";

            const {data} = await httpClient[requestMethod](url, variables, {
                headers,
            });

            return {
                data: data.data,
            };
        },

        getOne: async ({resource, id, meta}) => {
            const url = `${apiUrl}/${resource}/${id}`;

            const {headers, method} = meta ?? {};
            const requestMethod = (method as MethodTypes) ?? "get";

            const {data} = await httpClient[requestMethod](url, {headers});

            return {
                data: data.data,
            };
        },

        deleteOne: async ({resource, id, variables, meta}) => {
            const url = `${apiUrl}/${resource}/${id}`;

            const {headers, method} = meta ?? {};
            const requestMethod = (method as MethodTypesWithBody) ?? "delete";

            const {data} = await httpClient[requestMethod](url, {
                data: variables,
                headers,
            });

            return {
                data: data.data,
            };
        },

        getApiUrl: () => {
            return apiUrl;
        },

        custom: async ({
                           url,
                           method,
                           filters,
                           sorters,
                           payload,
                           query,
                           headers,
                       }) => {
            let requestUrl = `${url}?`;

            if (sorters) {
                const generatedSort = generateSort(sorters);
                if (generatedSort) {
                    const {_sort, _order} = generatedSort;
                    const sortQuery = {
                        _order_by: _sort.join(",").at(0),
                        _order_dir: _order.join(",").at(0),
                    };
                    requestUrl = `${requestUrl}&${queryString.stringify(sortQuery)}`;
                }
            }

            if (filters) {
                const filterQuery = generateFilter(filters);
                requestUrl = `${requestUrl}&${queryString.stringify(filterQuery)}`;
            }

            if (query) {
                requestUrl = `${requestUrl}&${queryString.stringify(query)}`;
            }

            let axiosResponse;
            switch (method) {
                case "put":
                case "post":
                case "patch":
                    axiosResponse = await httpClient[method](url, payload, {
                        headers,
                    });
                    break;
                case "delete":
                    axiosResponse = await httpClient.delete(url, {
                        data: payload,
                        headers: headers,
                    });
                    break;
                default:
                    axiosResponse = await httpClient.get(requestUrl, {
                        headers,
                    });
                    break;
            }

            const {data} = axiosResponse;

            return Promise.resolve({data: data.data});
        },
    }
};

export default dataProvider;