import {Tag} from "antd";
import React from "react";

export function DateDisplayField({value}: { value: string | Date, format?: string }) {
    return <Tag>{new Date(value).toLocaleDateString()}</Tag>;
}
