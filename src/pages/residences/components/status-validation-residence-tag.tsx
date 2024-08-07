import {StatusValidationResidence} from "@/core/domain/residences";
import {Tag} from "antd";
import {useTranslate} from "@refinedev/core";

type Props = {
    statusValidation: StatusValidationResidence;
}

export function StatusValidationResidenceTag({statusValidation}: Props) {
    const translate = useTranslate();
    const {name, color} = statusValidationToTagData(statusValidation);

    return <Tag color={color}>{translate(`tags.${name}`)}</Tag>
}

function statusValidationToTagData(statusValidation: StatusValidationResidence) {
    switch (statusValidation) {
        case StatusValidationResidence.Valide:
            return {name: "valided", color: "success"};
        case StatusValidationResidence.EnAttenteValidation:
            return {name: "pending", color: "warning"};
        case StatusValidationResidence.Rejete:
            return {name: "rejected", color: "error"};
    }
}