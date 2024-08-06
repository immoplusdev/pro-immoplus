export const localStorageProvider = (() =>
    (
        {
            getAuthData: () => {
                const data =
                    typeof window !== "undefined" &&
                    window.localStorage.getItem("directus_storage");
                if (data) {
                    return JSON.parse(data);
                }
                return null;
            },

            setAuthData: (value: Record<string, any> | null) => {
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
        }
    ))