import {useTranslate} from "@refinedev/core";
import {Tag} from "antd";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";


type Props = {
    statusValidation: StatusValidationBiensImmobilers;
}

export function StatusValidationBiensImmobilersTag({statusValidation}: Props) {
    const translate = useTranslate();
    const {name, color} = StatusValidationToTagData({statusValidation});

    return <Tag color={color}>{translate(`tags.${name}`)}</Tag>;
}

function StatusValidationToTagData({statusValidation}: Props) {
    switch (statusValidation) {
        case StatusValidationBiensImmobilers.Valide:
            return {name: "valide", color: "success"};
        case StatusValidationBiensImmobilers.EnAttenteValidation:
            return {name: "en_attente_validation", color: "warning"};
        case StatusValidationBiensImmobilers.Rejete:
            return {name: "rejected", color: "error"};
        default:
            return {name: `${statusValidation}`, color: "warning"}
    }
}