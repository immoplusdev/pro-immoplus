import {ReactNode} from "react";
import {ColProps} from "antd/es/grid/col";
import {Col, Row, RowProps} from "antd";

type Props = {
    children: ReactNode[];
    rowProps?: RowProps;
    colProps?: ColProps;
}

export function ColList(props: Props) {
    const rowProps = props.rowProps || {};
    const colProps = props.colProps || {};

    return (<>
        {transformArray(props.children).map((child, index) => (
            <Row key={index} {...rowProps}>
                {child.map((column, columnIndex) => (
                    <Col key={columnIndex} {...colProps}>
                        {column}
                    </Col>
                ))}
            </Row>
        ))}
    </>);
}

function transformArray(arr: ReactNode[]): ReactNode[][] {
    const result: number[][] = [];
    for (let i = 0; i < arr.length; i += 2) {
        result.push([arr[i] as never, arr[i + 1]] as never);
    }
    return result;
}