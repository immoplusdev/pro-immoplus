import {Role} from "@/core/domain/auth/role.model";
import {UserData} from "@/core/domain/users/user-data.model";

export interface User {

    // basic fields
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    language?: string;
    avatar?: string;
    phoneNumber: string;

    // User Data
    country?: string;
    state?: string;
    city?: string;
    commune?: string;
    address?: string;
    address2?: string;
    currency?: string;
    additionalData?: UserData;

    // Status fields
    identityVerified: boolean;
    emailVerified: boolean;
    phoneNumberVerified: boolean;
    compteProValide: boolean;
    authLoginAttempts: number;
    status: UserStatus;

    // Dates and accountability fields
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
    deletedAt?: Date;
    deletedBy?: string;
}

export enum UserStatus {
    Active = 'Active',
    Blocked = 'Blocked',
}

export enum UserRole {
    Customer = "customer",
    Admin = "admin",
    ProEntreprise = "pro_entreprise",
    ProParticulier = "pro_particulier",
}
