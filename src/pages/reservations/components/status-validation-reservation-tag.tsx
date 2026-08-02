import {useTranslate} from "@refinedev/core";
import {StatusFacture} from "@/lib/ts-utilities/enums/status-facture";
import {OutlineTag} from "@/components/table";


type Props = {
    statusValidation: string;
}

export function StatusValidationReservationTag({statusValidation}: Props) {
    const translate = useTranslate();
    const {name, color} = statusValidationToTagData(statusValidation);

    return <OutlineTag color={color}>{translate(`tags.${name}`)}</OutlineTag>
}

function statusValidationToTagData(statusValidation: string) {
    switch (statusValidation) {
        case StatusFacture.Paye:
            return {name: StatusFacture.Paye, color: "#1F8A5B"};
        case StatusFacture.NonPaye:
            return {name: StatusFacture.NonPaye, color: "#C13838"};
        default:
            return {name: StatusFacture.NonPaye, color: "#C13838"};
    }
}