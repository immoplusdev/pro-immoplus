import {useFilter} from "@/hooks";
import {Button} from "antd";
import React from "react";
import {FilterFilled, FilterOutlined} from "@ant-design/icons";

export function ToggleFilterButton() {
    const {filterVisible, toggleFilter} = useFilter();
    return (
        <Button
            onClick={() => toggleFilter()}
            className="flex items-center justify-center w-10 h-10 bg-primary rounded-full"
        >
            {filterVisible ? (
                <FilterFilled color={"primary"}/>
            ) : (
                <FilterOutlined color={"primary"}/>
            )}
        </Button>);
}
