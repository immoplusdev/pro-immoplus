import {
  AuthenticationData,
  AuthenticationStorage,
  authentication,
  createDirectus,
  rest,
  realtime,
} from "@tspvivek/refine-directus";

export const API_URL =
  process.env.NODE_ENV != "development" ? "/" : "http://localhost:8055";

export const authLocalStorage = () =>
  ({
    get: async () => {
      const data =
        typeof window !== "undefined" &&
        window.localStorage.getItem("directus_storage");
      if (data) {
        return JSON.parse(data);
      }
      return null;
    },

    set: async (value: AuthenticationData | null) => {
      if (!value) {
        return (
          typeof window !== "undefined" &&
          window.localStorage.removeItem("directus_storage")
        );
      }
      return (
        typeof window !== "undefined" &&
        window.localStorage.setItem("directus_storage", JSON.stringify(value))
      );
    },
  } as AuthenticationStorage);

export const directusClient = createDirectus(API_URL)
  .with(authentication("json", { storage: authLocalStorage() }))
  .with(rest())
  .with(
    realtime({
      authMode: "handshake",
    })
  );
