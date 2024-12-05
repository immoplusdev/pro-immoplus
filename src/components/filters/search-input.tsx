import {FormProps, Input} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import React, {useCallback, useEffect, useState} from "react";
import {useTranslate} from "@refinedev/core";
import type {CrudFilter} from "@refinedev/core/dist/contexts/data/types";
import debounce from 'lodash.debounce';

type Props = {
    setFilters: ((filters: CrudFilter[], behavior?: any) => void) & ((setter: (prevFilters: CrudFilter[]) => CrudFilter[]) => void);
    filters?: CrudFilter[];
}

export function SearchInput({setFilters, filters}: Props) {
    const translate = useTranslate();
    const [value, setValue] = useState<string | undefined>(undefined);

    const handleSearch = useCallback(
        debounce((value: string | undefined) => {
            setFilters((prevFilters) => {
                const newFilters = prevFilters.filter((filter) => (filter as Record<string, any>).field !== "search");
                if (value) {
                    newFilters.push({
                        field: "q",
                        operator: "eq",
                        value: value
                    });
                }
                return newFilters;
            });
            console.log("Search value:", value);
            console.log(filters)
        }, 500),
        []
    );

    useEffect(() => {
        handleSearch(value);
    }, [value, handleSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value === "" ? undefined : e.target.value);
    };


    return (
        <Input
            placeholder={translate("common.write_something_here")}
            prefix={<SearchOutlined/>}
            onChange={handleChange}
        />
    )
}
