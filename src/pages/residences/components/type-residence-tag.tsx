import {useTranslate} from "@refinedev/core";
import {OutlineTag} from "./outline-tag";

type Props = {
    typeResidence: string;
}

export function TypeResidenceTag({typeResidence}: Props) {
    const translate = useTranslate();
    const {name} = typeResidenceToTagData(typeResidence);

    return <OutlineTag color="#185FA5">{translate(`tags.${name}`)}</OutlineTag>
}

function typeResidenceToTagData(typeResidence: string) {
    return { name: typeResidence};
}