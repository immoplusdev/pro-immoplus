import {enumToList} from "@/lib/ts-utilities";
import {StatusDemandeVisite, TypeDemandeVisite} from "@/core/domain/demande-visite/demande-visite.model";

export const statusValidationDemandeVisite = enumToList(StatusDemandeVisite)

export const typeDemandeVisiteList = enumToList(TypeDemandeVisite);
