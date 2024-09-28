import {enumToList} from "@/lib/ts-utilities";

export enum StatusReservation {
  Rejete = "rejete",
  Valide = "valide",
  EnCours = "en_cours",
  EnCoursValidationUser = "en_cours_validation_user",
  EnCoursValidationAdmin = "en_cours_validation_admin"
}
export enum StatusUser {
  Rejete = "rejete",
  Valide = "valide",
  EnCours = "en_cours",
  EnCoursValidationUser = "en_cours_validation_user",
  EnCoursValidationAdmin = "en_cours_validation_admin"
}

export enum ResidenceValide {
  Oui = "oui",
  Non = "non"
}
export enum bienImmobilierDisponible {
  Oui = "oui",
  Non = "non"
}
export enum TypeDemandeVisite {
  Express = "express",
  Normal = "normal"
}
export enum StatusDemandeVisite {
  Rejete = "rejete",
  Valide = "valide",
  EnCours = "en_cours",
  EnCoursValidationUser = "en_cours_validation_user",
  EnCoursValidationAdmin = "en_cours_validation_admin"
}



