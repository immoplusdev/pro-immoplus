import {enumToList} from "@/lib/ts-utilities";
import {StatusValidationResidence} from "@/core/domain/residences";
import {StatusDemandeVisite, TypeDemandeVisite} from "@/lib/ts-utilities/enums/status-reservation";

export const statusValidationResidence = enumToList(StatusValidationResidence);
export const typeDemandeVisiteList = enumToList(TypeDemandeVisite);
export const statusDemandeVisite = enumToList(StatusDemandeVisite);

