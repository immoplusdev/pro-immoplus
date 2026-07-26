import {GeoJsonPoint} from "@/core/domain/map/geo-json-point.model";
import {OmitMethods} from "@/lib/ts-utilities/types/omit-method";

export enum StatusValidationResidence {
    Valide = "valide",
    EnAttenteValidation = "en_attente_validation",
    Rejete = "rejete"
}

export enum TypeResidence {
    Appartement = "appartement",
    Maison = "maison",
    Villa = "villa"
}

export type StatusValidationBienImmobilier = StatusValidationResidence;

export interface Commodite {
    id: string;
    nom: string;
}

export interface Piece {
    id: string;
    nom: string;
    nombre?: number;
}

export interface Ville {
    id: string;
    nom: string;
}

export interface Commune {
    id: string;
    nom: string;
}

export interface ServiceDates {
    dateDebut?: string;
    dateFin?: string;
}

export class Residence {
    id: string;
    miniature: string;
    nom: string;
    typeResidence: TypeResidence;
    description: string;
    commodites?: Commodite[];
    pieces?: Piece[];
    images?: string[];
    video?: string;
    ville?: string;
    commune?: string;
    ville_model?: Ville;
    commune_model?: Commune;
    adresse?: string;
    position?: GeoJsonPoint;
    latitude?: number;
    longitude?: number;
    residenceDisponible: boolean;
    statusValidation: StatusValidationBienImmobilier;
    prixReservation: number;
    reduction: number;
    dureeMinSejour: number;
    dureeMaxSejour: number;
    metadata?: Record<string, any>;
    heureEntree: string;
    heureDepart: string;
    nombreMaxOccupants: number;
    animauxAutorises: boolean;
    fetesAutorises: boolean;
    reglesSupplementaires?: string;
    hasJacuzzi: boolean;
    hasPiscine: boolean;
    tarifHoraire?: number;
    datesReservation?: ServiceDates;
    score: number;
    viewsCount?: number;
    likesCount?: number;
    proprietaire?: string;

    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;

    constructor(data?: OmitMethods<Residence>) {
        if (data) Object.assign(this, data);
    }
}
