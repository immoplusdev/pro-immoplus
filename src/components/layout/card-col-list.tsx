import React, {ReactNode} from "react";
import {Card} from "antd";
import {useTranslate} from "@refinedev/core";

type Props = {
    children: ReactNode[];
}

function splitArray(arr: any[]): [any[], any[]] {
    const oddIndexArray: any[] = [];
    const evenIndexArray: any[] = [];

    arr.forEach((element, index) => {
        if (index % 2 === 0) {
            oddIndexArray.push(element);
        } else {
            evenIndexArray.push(element);
        }
    });

    return [oddIndexArray, evenIndexArray];
}

export function CardColList({children}: Props) {
    const [oddIndexArray, evenIndexArray] = splitArray(children);
    const translate = useTranslate();
    return (
        <>
            {
                oddIndexArray.map((item) => (
                    <Card style={{border: "none", width: "50%", display: "flex", flexDirection: "row"}}>
                        {item}
                    </Card>
                ))
            }

            {
                evenIndexArray.map((item) => (
                    <Card style={{width: "50%", border: "none"}}>
                        {item}
                    </Card>
                ))
            }
        </>);
}
