import {enumToList} from "@/lib/ts-utilities";

export enum StatusReservation {
  Rejete = "rejete",
  Terminee = "terminee",
  Valide = "valide",
  EnCours = "en_cours",
  EnAttenteReponseProprietaire = "en_attente_reponse_proprietaire",
  EnAttentePaiementClient = "en_attente_paiement_client",
  ProprietaireAnnuleReservation = "proprietaire_annule_reservation",
  ProprietaireSansReponse = "proprietaire_sans_reponse",
  clientAnnuleReservation = "client_annule_reservation",
  ClientSansReponse = "client_sans_reponse",
}

export enum ResidenceValide {
  Oui = "oui",
  Non = "non"
}






