import {AccessControlProvider} from "@refinedev/core";

const accessControlProvider: AccessControlProvider = {
    can: async ({resource, action, params}) => {
        // if (resource === "posts" && action === "edit") {
        //     return {
        //         can: false,
        //         reason: "Unauthorized",
        //     };
        // }
        return {can: true};
    },
    options: {
        buttons: {
            enableAccessControl: true,
            hideIfUnauthorized: true,
        },
        queryOptions: {
            // ... default global query options
        },
    },
}

export default accessControlProvider;