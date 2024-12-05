import {Tag} from "antd";
import {useTranslate} from "@refinedev/core";
import {PaymentStatus} from "@/core/domain/payments";

type Props = {
    value: string;
}

export function StatusPaymentTag({value}: Props) {
    const translate = useTranslate();
    const {name, color} = valueToTagData(value);

    return <Tag color={color}>{translate(name)}</Tag>
}

function valueToTagData(value: string) {
    const baseName = `pages.payment.tags.${value}`;
    switch (value) {
        case PaymentStatus.Successful:
            return {name: baseName, color: "success"};
        case PaymentStatus.Processing:
            return {name: baseName, color: "warning"};
        case PaymentStatus.WaitingForValidation:
            return {name: baseName, color: "warning"};
        case PaymentStatus.ActionRequired:
            return {name: baseName, color: "warning"};
        case PaymentStatus.PaymentRequired:
            return {name: baseName, color: "warning"};
        case PaymentStatus.Failed:
            return {name: baseName, color: "error"};
        default:
            return {name: baseName, color: "default"};
    }
}
