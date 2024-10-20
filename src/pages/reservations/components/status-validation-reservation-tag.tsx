import {Tag} from "antd";
import {useTranslate} from "@refinedev/core";
import {StatusFacture} from "@/lib/ts-utilities/enums/status-facture";


type Props = {
    statusValidation: string;
}

export function StatusValidationReservationTag({statusValidation}: Props) {
    const translate = useTranslate();
    const {name, color} = statusValidationToTagData(statusValidation);

    return <Tag color={color}>{translate(`tags.${name}`)}</Tag>
}

function statusValidationToTagData(statusValidation: string) {
    switch (statusValidation) {
        case StatusFacture.Paye:
            return {name: StatusFacture.Paye, color: "success"};
        case StatusFacture.NonPaye:
            return {name: StatusFacture.NonPaye, color: "error"};
        default:
            return {name: StatusFacture.NonPaye, color: "error"};
    }
}