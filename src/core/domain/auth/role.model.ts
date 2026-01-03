export class Role {

    id: string;

    name: string;

    description?: string;

    icon?: string;

    enforceTfa: boolean;

    appAccess: boolean;

    adminAccess: boolean;
}