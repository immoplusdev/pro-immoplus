import {StatusDemandeVisite} from "@/core/domain/demande-visite/demande-visite.model";
import {Tag} from "antd";
import {useTranslate} from "@refinedev/core";


type Props = {
    statusValidation : StatusDemandeVisite
}


export function StatusValidationDemandeVisiteTag ({statusValidation}: Props){
    const translate = useTranslate()
    const {name, color} = StatusDemandeVisiteData({statusValidation})

    return <Tag color={color}>{translate(`tags.${name}`)}</Tag>

}

function StatusDemandeVisiteData ({statusValidation}: Props){
    switch (statusValidation) {
        case StatusDemandeVisite.Valide:
            return {name: "valide", color: "success"}
        case StatusDemandeVisite.EnCours:
            return {name: "en_cours", color: "warning"}
        case StatusDemandeVisite.Rejete:
            return {name: "rejected", color: "error"}
        case StatusDemandeVisite.EnCoursValidationUser:
            return {name: "en_cours_validation_user", color: "warning"}
        case StatusDemandeVisite.EnCoursValidationAdmin:
            return {name: "en_cours_validation_admin", color: "warning"}
        default:
            return{name: `${statusValidation}`, color: "warning"}

    }
}