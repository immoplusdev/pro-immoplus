import {User, UserRole} from "@/core/domain/users/user.model";

export interface AuthService {
    login(username: string, password: string): Promise<
        {
            access_token?: string,
            refresh_token: string,
            expires: number,
            expires_at: string,
            message?: undefined
        } | { message: string; access_token: null; }>;

    getToken(): boolean;

    logout(): Promise<void>;

    setUserToken(token: string): void;

    getUserData(): Promise<User>;

    getUserRole(user: Partial<User>): UserRole;

    isUserAdmin(user: Partial<User>): boolean;

    canAccessResource(user: Partial<User>, resource: string, action: string): boolean;
}