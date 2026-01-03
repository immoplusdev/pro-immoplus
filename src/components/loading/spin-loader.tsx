import React from "react";
import {Spin} from "antd";

export function SpinLoader() {
    return (
        <div className="h-full w-full flex items-center justify-around">
            <Spin/>
        </div>
    )
}
