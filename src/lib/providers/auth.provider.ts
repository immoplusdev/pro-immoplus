import {AuthBindings} from "@refinedev/core";
import {authService} from "@/lib/services/auth";

export const authProvider: AuthBindings = {

    onError: async (error) => {
        console.error(error);
        return {error};
    },

    login: async (params) => {
        const response = await authService.login(params.email, params.password);
        return response.access_token
            ? {
                success: true,
                redirectTo: "/",
            }
            : {
                success: false,
                error: {
                    name: "Auth Error",
                    message: response.message as string,
                },
            };
    },

    logout: async () => {
        await authService.logout();
        return {
            success: true,
            redirectTo: "/login",
        };
    },

    check: async () => {
        const token = await authService.getToken();

        if (token) {
            return {
                authenticated: true,
            };
        } else {
            return {
                authenticated: false,
                success: false,
                redirectTo: "/login",
            };
        }
    },

    getPermissions: async () => null,

    getIdentity: async () => {
        try {

            const data = await authService.getUserData();
            if (!data) throw new Error();
            return data;
        } catch (e) {
            // window.location.href = "/login";
            return {
                authenticated: false,
                redirectTo: "/login",
            };
        }
    },

};

