export interface UserData {
  id: string;
  lieuNaissance?: string;
  activite?: string;
  photoIdentiteId?: string;
  pieceIdentiteId?: string;

  // Pro entreprise
  
  nomEntreprise?: string;
  emailEntreprise?: string;
  registreCommerceId?: string;
  numeroContribuable?: string;
  typeEntreprise?: string;
}

