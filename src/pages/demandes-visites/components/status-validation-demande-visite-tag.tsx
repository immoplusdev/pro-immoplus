import {StatusDemandeVisite} from "@/core/domain/demande-visite/demande-visite.model";
import {useTranslate} from "@refinedev/core";
import {OutlineTag} from "./outline-tag";


type Props = {
    statusValidation : StatusDemandeVisite
}


export function StatusValidationDemandeVisiteTag ({statusValidation}: Props){
    const translate = useTranslate()
    const {name, color} = StatusDemandeVisiteData({statusValidation})

    return <OutlineTag color={color}>{translate(`tags.${name}`)}</OutlineTag>

}

function StatusDemandeVisiteData ({statusValidation}: Props){
    switch (statusValidation) {
        case StatusDemandeVisite.Valide:
            return {name: "valide", color: "#1F8A5B"}
        case StatusDemandeVisite.EnCours:
            return {name: "en_cours", color: "#B86B0A"}
        case StatusDemandeVisite.Rejete:
            return {name: "rejected", color: "#C13838"}
        case StatusDemandeVisite.EnCoursValidationUser:
            return {name: "en_cours_validation_user", color: "#B86B0A"}
        case StatusDemandeVisite.EnCoursValidationAdmin:
            return {name: "en_cours_validation_admin", color: "#B86B0A"}
        default:
            return{name: `${statusValidation}`, color: "#B86B0A"}

    }
}