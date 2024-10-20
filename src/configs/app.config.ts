export const isDev = import.meta.env.MODE === "development";
export const ROUTE_PREFIX = "/backoffice";
export const PROJECT_NAME = "Immoplus";
export const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || "xntn5Z-AEaHwy-gkPtSa"
export const API_URL = isDev ? import.meta.env.VITE_API_URL : (import.meta.env.VITE_API_PROD_URL || "https://api-v2.immoplus.ci");
