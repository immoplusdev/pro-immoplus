import {Tag} from "antd";
import {useTranslate} from "@refinedev/core";
import {StatusFacture, StatusValidationReservation} from "@/core/domain/reservations";
import {TypeResidence} from "@/core/domain/residences";

type Props = {
    typeResidence: string;
}

export function TypeResidenceTag({typeResidence}: Props) {
    const translate = useTranslate();
    const {name} = typeResidenceToTagData(typeResidence);

    return <Tag>{translate(`tags.${name}`)}</Tag>
}

function typeResidenceToTagData(typeResidence: string) {
    return { name: typeResidence};
}