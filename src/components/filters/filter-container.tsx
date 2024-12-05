import {Col, Form, FormProps} from "antd";
import React, {useMemo} from "react";
import {useFilter} from "@/hooks";

type Props = {
    searchFormProps: FormProps;
    children: React.ReactNode | React.ReactNode[];
}

export function FilterContainer({searchFormProps, children}: Props) {
    const {filterVisible} = useFilter();

    console.log("filterVisible in button", filterVisible)

    // if(!visible) return null;
    return (
       <>

       </>
    );
}
