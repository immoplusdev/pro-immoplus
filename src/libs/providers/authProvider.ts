import { AuthHelper } from "@tspvivek/refine-directus";
import { directusClient } from "./directusClient";
import { AuthBindings } from "@refinedev/core";
import { AuthService } from "../services/auth/authService";

const directusAuthHelper = AuthHelper(directusClient);
const authService = new AuthService();

const authProvider: AuthBindings = {
  onError: async (error) => {
    console.error(error);
    return { error };
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
    directusAuthHelper.logout();
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = await directusAuthHelper.getToken();
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
      const data = await directusAuthHelper.me({ fields: ["*.*"] });
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

export default authProvider;
