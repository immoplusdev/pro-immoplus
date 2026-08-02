import {useTranslate} from "@refinedev/core";
import {PaymentStatus} from "@/core/domain/payments";
import {OutlineTag} from "@/components/table";

type Props = {
    value: string;
}

export function StatusPaymentTag({value}: Props) {
    const translate = useTranslate();
    const {name, color} = valueToTagData(value);

    return <OutlineTag color={color}>{translate(name)}</OutlineTag>
}

function valueToTagData(value: string) {
    const baseName = `pages.payment.tags.${value}`;
    switch (value) {
        case PaymentStatus.Successful:
            return {name: baseName, color: "#1F8A5B"};
        case PaymentStatus.Processing:
            return {name: baseName, color: "#B86B0A"};
        case PaymentStatus.WaitingForValidation:
            return {name: baseName, color: "#B86B0A"};
        case PaymentStatus.ActionRequired:
            return {name: baseName, color: "#B86B0A"};
        case PaymentStatus.PaymentRequired:
            return {name: baseName, color: "#B86B0A"};
        case PaymentStatus.Failed:
            return {name: baseName, color: "#C13838"};
        default:
            return {name: baseName, color: "#5F5E5A"};
    }
}
