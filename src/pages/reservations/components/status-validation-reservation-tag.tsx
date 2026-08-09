import {useTranslate} from "@refinedev/core";
import {StatusFacture} from "@/lib/ts-utilities/enums/status-facture";
import {PillTag, PillTone} from "@/components/table";


type Props = {
    statusValidation: string;
}

export function StatusValidationReservationTag({statusValidation}: Props) {
    const translate = useTranslate();
    const {name, tone} = statusValidationToTagData(statusValidation);

    return <PillTag tone={tone}>{translate(`tags.${name}`)}</PillTag>
}

function statusValidationToTagData(statusValidation: string): {name: string; tone: PillTone} {
    switch (statusValidation) {
        case StatusFacture.Paye:
            return {name: StatusFacture.Paye, tone: "success"};
        case StatusFacture.NonPaye:
            return {name: StatusFacture.NonPaye, tone: "error"};
        default:
            return {name: StatusFacture.NonPaye, tone: "error"};
    }
}