const STORAGE_KEY = "admin_app_storage";

export const getLocalStorageProvider = (() =>
    (
        {
            getAuthData: () => {
                const data =
                    typeof window !== "undefined" &&
                    window.localStorage.getItem(STORAGE_KEY);
                if (data) {
                    return JSON.parse(data);
                }
                return null;
            },

            setAuthData: (value: Record<string, any> | null) => {
                if (!value) {
                    return (
                        typeof window !== "undefined" &&
                        window.localStorage.removeItem(STORAGE_KEY)
                    );
                }
                return (
                    typeof window !== "undefined" &&
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
                );
            },
        }
    ))