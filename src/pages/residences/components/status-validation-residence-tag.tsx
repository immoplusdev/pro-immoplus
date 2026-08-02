import {StatusValidationResidence} from "@/core/domain/residences";
import {useTranslate} from "@refinedev/core";
import {OutlineTag} from "./outline-tag";

type Props = {
    statusValidation: StatusValidationResidence;
}

export function StatusValidationResidenceTag({statusValidation}: Props) {
    const translate = useTranslate();
    const {name, color} = statusValidationToTagData(statusValidation);

    return <OutlineTag color={color}>{translate(`tags.${name}`)}</OutlineTag>
}

function statusValidationToTagData(statusValidation: StatusValidationResidence) {
    switch (statusValidation) {
        case StatusValidationResidence.Valide:
            return {name: "valided", color: "#1F8A5B"};
        case StatusValidationResidence.EnAttenteValidation:
            return {name: "pending", color: "#B86B0A"};
        case StatusValidationResidence.Rejete:
            return {name: "rejected", color: "#C13838"};
    }
}