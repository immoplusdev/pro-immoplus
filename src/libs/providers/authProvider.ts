import { AuthHelper } from "@tspvivek/refine-directus";
import { directusClient } from "./directusClient";
import { AuthBindings } from "@refinedev/core";
import { getAuthRoutePath, getRoutePath } from "../helpers/routing.helper";

const directusAuthHelper = AuthHelper(directusClient);
export const TOKEN_KEY = "refine-auth";

const authProvider: AuthBindings = {
  onError: async (error) => {
    console.error(error);
    return { error };
  },

  login: async ({ username, password }) => {
    const { access_token } = await directusAuthHelper.login(username, password);
    return access_token
      ? {
          success: true,
          redirectTo: getRoutePath("/"),
        }
      : {
          success: false,
          error: {
            name: "LoginError",
            message: "Invalid username or password",
          },
        };
  },

  logout: async () => {
    directusAuthHelper.logout();
    return {
      success: true,
      redirectTo: getAuthRoutePath("/login"),
    };
  },

  check: async () => {
    if (directusAuthHelper.getToken()) {
      return {
        authenticated: true,
      };
    } else {
      return {
        authenticated: false,
        // redirectTo: "/login",
      };
    }
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    try {
      const data = await directusAuthHelper.me({ fields: ["*.*"] });
      return data;
    } catch (e) {
      console.log("not authenticated")
      // window.location.href = getAuthRoutePath("/login");
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },
};

export default authProvider;
