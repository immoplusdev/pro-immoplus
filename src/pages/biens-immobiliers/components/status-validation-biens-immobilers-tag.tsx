import {useTranslate} from "@refinedev/core";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";
import {OutlineTag} from "./outline-tag";


type Props = {
    statusValidation: StatusValidationBiensImmobilers;
}

export function StatusValidationBiensImmobilersTag({statusValidation}: Props) {
    const translate = useTranslate();
    const {name, color} = StatusValidationToTagData({statusValidation});

    return <OutlineTag color={color}>{translate(`tags.${name}`)}</OutlineTag>;
}

function StatusValidationToTagData({statusValidation}: Props) {
    switch (statusValidation) {
        case StatusValidationBiensImmobilers.Valide:
            return {name: "valide", color: "#1F8A5B"};
        case StatusValidationBiensImmobilers.EnAttenteValidation:
            return {name: "en_attente_validation", color: "#B86B0A"};
        case StatusValidationBiensImmobilers.Rejete:
            return {name: "rejected", color: "#C13838"};
        default:
            return {name: `${statusValidation}`, color: "#B86B0A"}
    }
}