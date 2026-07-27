import {Input} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import React, {useCallback, useEffect, useState} from "react";
import {useTranslate} from "@refinedev/core";
import type {CrudFilter, GetListResponse} from "@refinedev/core/dist/contexts/data/types";
import debounce from 'lodash.debounce';
import type {QueryObserverResult} from "@tanstack/react-query";
import {useLocation} from "react-router-dom";

type Props = {
    setFilters: ((filters: CrudFilter[], behavior?: any) => void) & ((setter: (prevFilters: CrudFilter[]) => CrudFilter[]) => void);
    tableQuery: QueryObserverResult<GetListResponse<any>, any>;
}

export function SearchInput({setFilters, tableQuery}: Props) {
    const translate = useTranslate();
    const location = useLocation();
    const storageKey = `search_${location.pathname}`;
    const [value, setValue] = useState<string | undefined>(
        () => sessionStorage.getItem(storageKey) || undefined
    );

    const handleSearch = useCallback(
        debounce((value: string | undefined) => {
            setFilters((prevFilters) => {
                const newFilters = prevFilters.filter((filter) => (filter as Record<string, any>).field !== "q");
                if (value) {
                    newFilters.push({
                        field: "q",
                        operator: "eq",
                        value: value
                    });


                }
                setFilters(newFilters);
                tableQuery.refetch();
                return newFilters;
            });
        }, 500),
        []
    );

    useEffect(() => {
        handleSearch(value);
    }, [value, handleSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value === "" ? undefined : e.target.value;
        if (newValue) {
            sessionStorage.setItem(storageKey, newValue);
        } else {
            sessionStorage.removeItem(storageKey);
        }
        setValue(newValue);
    };


    return (
        <Input
            placeholder={translate("common.write_something_here")}
            prefix={<SearchOutlined/>}
            value={value ?? ""}
            onChange={handleChange}
        />
    )
}
