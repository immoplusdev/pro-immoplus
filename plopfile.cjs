/* eslint-disable no-undef */
const {
    camelize,
    pluralize,
    singularize,
    dasherize,
    underscore,
    humanize,
    capitalize,
    titleize,
    tableize,
    classify,
    // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
} = require("inflection");

module.exports = function (plop) {
    plop.setHelper("upperCase", (text) => text.toUpperCase());
    plop.setHelper("lowerCase", (text) => text.toLowerCase());
    plop.setHelper("camelCase", (text) =>
        camelize(text.replaceAll("-", "_"), true)
    );


    plop.setHelper("plural", (text) => pluralize(text.replaceAll("-", "_")));
    plop.setHelper("singular", (text) => singularize(text.replaceAll("-", "_")));

    plop.setHelper("dasherizePlural", (text) => dasherize(pluralize(text.replaceAll("-", "_"))));
    plop.setHelper("dasherizeSingular", (text) => dasherize(singularize(text.replaceAll("-", "_"))));

    plop.setHelper("upperCaseFirst", (text) =>
        camelize(text.replaceAll("-", "_"), true)
    );
    plop.setHelper("lowerCaseFirst", (text) =>
        camelize(text.replaceAll("-", "_"), false)
    );
    plop.setHelper("dasherize", (text) => dasherize(text.replaceAll("-", "_")));
    plop.setHelper("underscore", (text) => underscore(text.replaceAll("-", "_")));
    plop.setHelper("humanize", (text) => humanize(text.replaceAll("-", "_")));
    plop.setHelper("capitalize", (text) => capitalize(text.replaceAll("-", "_")));
    plop.setHelper("titleize", (text) => titleize(text.replaceAll("-", "_")));
    plop.setHelper("tableize", (text) => tableize(text.replaceAll("-", "_")));
    plop.setHelper("classify", (text) => classify(text.replaceAll("-", "_")));
    plop.setHelper("classifyPlural", (text) => pluralize(classify(text.replaceAll("-", "_"))));
    plop.setHelper("classifySingular", (text) => singularize(classify(text.replaceAll("-", "_"))));

    plop.setHelper("exceptionnify", (text) =>
        text.replaceAll("-", "_").toUpperCase()
    );

    // const basePrompts = [
    //   {
    //     type: "input",
    //     name: "name",
    //     message: "entity name",
    //   },
    // ];

    const groupPrompts = [
        {
            type: "input",
            name: "name",
            message: "entity name",
        },
        {
            type: "input",
            name: "group",
            message: "group name",
        },
    ];

    const generateCreateResourcePage = [
        {
            type: "add",
            path: "src/pages/{{dasherize group}}/create-{{dasherizeSingular name}}.tsx",
            templateFile: "plop-templates/pages/base/create.hbs",
        },
    ];

    const generateEditResourcePage = [
        {
            type: "add",
            path: "src/pages/{{dasherize group}}/edit-{{dasherizeSingular name}}.tsx",
            templateFile: "plop-templates/pages/base/edit.hbs",
        },
    ];

    const generateListResourcesPage = [
        {
            type: "add",
            path: "src/pages/{{dasherize group}}/list-{{dasherize name}}.tsx",
            templateFile: "plop-templates/pages/base/list.hbs",
        },
    ];

    const generateShowResourcePage = [
        {
            type: "add",
            path: "src/pages/{{dasherize group}}/show-{{dasherizeSingular name}}.tsx",
            templateFile: "plop-templates/pages/base/show.hbs",
        },
    ];

    const generateResourcePageIndex = [
        {
            type: "add",
            path: "src/pages/{{dasherize group}}/index.tsx",
            templateFile: "plop-templates/pages/base/index.hbs",
        },
    ];


    // const generateModel = [
    //     {
    //         type: "add",
    //         path: "src/core/domain/{{dasherize group}}/{{dasherize name}}.model.ts",
    //         templateFile: "plop-templates/core/domain/models/base.model.hbs",
    //     },
    // ];
    //
    // const generateRepositoryPort = [
    //     {
    //         type: "add",
    //         path: "src/core/domain/{{dasherize group}}/{{dasherize name}}-repository.port.ts",
    //         templateFile:
    //             "plop-templates/core/application/ports/repositories/base-repository.port.hbs",
    //     },
    // ];
    //
    // const generateServicePort = [
    //     {
    //         type: "add",
    //         path: "src/core/domain/{{dasherize group}}/{{dasherize name}}-service.port.ts",
    //         templateFile:
    //             "plop-templates/core/application/ports/services/base-service.port.hbs",
    //     },
    // ];
    //
    // const generateRepository = [
    //     {
    //         type: "add",
    //         path: "src/infrastructure/directus-adapter/repositories/{{dasherize group}}/{{dasherize name}}.repository.ts",
    //         templateFile:
    //             "plop-templates/infrastructure/directus-adapter/repositories/base.repository.hbs",
    //     },
    // ];
    //
    // const generateService = [
    //     {
    //         type: "add",
    //         path: "src/infrastructure/directus-adapter/services/{{dasherize group}}/{{dasherize name}}.service.ts",
    //         templateFile:
    //             "plop-templates/infrastructure/directus-adapter/services/base.service.hbs",
    //     },
    // ];
    //
    // const generateEndpoint = [
    //     {
    //         type: "add",
    //         path: "src/infrastructure/directus-endpoints-adapter/{{dasherize name}}/dtos/{{dasherize name}}.dto.ts",
    //         templateFile:
    //             "plop-templates/infrastructure/directus-endpoints-adapter/dtos/base.dto.hbs",
    //     },
    //     {
    //         type: "add",
    //         path: "src/infrastructure/directus-endpoints-adapter/{{dasherize name}}/{{dasherize name}}.controller.doc.ts",
    //         templateFile:
    //             "plop-templates/infrastructure/directus-endpoints-adapter/base.controller.doc.hbs",
    //     },
    //     {
    //         type: "add",
    //         path: "src/infrastructure/directus-endpoints-adapter/{{dasherize name}}/{{dasherize name}}.controller.ts",
    //         templateFile:
    //             "plop-templates/infrastructure/directus-endpoints-adapter/base.controller.hbs",
    //     },
    // ];
    //
    // const generateCommand = [
    //     {
    //         type: "add",
    //         path: "src/core/application/features/{{dasherize group}}/commands/{{dasherize name}}.command.ts",
    //         templateFile:
    //             "plop-templates/core/application/features/base/commands/base.command.hbs",
    //     },
    //     {
    //         type: "add",
    //         path: "src/core/application/features/{{dasherize group}}/command-handlers/{{dasherize name}}-command-handler.service.ts",
    //         templateFile:
    //             "plop-templates/core/application/features/base/command-handlers/base-command-handler.service.hbs",
    //     },
    //     {
    //         type: "add",
    //         path: "src/core/application/features/{{dasherize group}}/responses/{{dasherize name}}-command.response.ts",
    //         templateFile:
    //             "plop-templates/core/application/features/base/responses/base-command.response.hbs",
    //     },
    // ];
    //
    // const generateQuery = [
    //     {
    //         type: "add",
    //         path: "src/core/application/features/{{dasherize group}}/queries/{{dasherize name}}.query.ts",
    //         templateFile:
    //             "plop-templates/core/application/features/base/queries/base.query.hbs",
    //     },
    //     {
    //         type: "add",
    //         path: "src/core/application/features/{{dasherize group}}/query-handlers/{{dasherize name}}-query-handler.service.ts",
    //         templateFile:
    //             "plop-templates/core/application/features/base/query-handlers/base-query-handler.service.hbs",
    //     },
    //     {
    //         type: "add",
    //         path: "src/core/application/features/{{dasherize group}}/responses/{{dasherize name}}-query.response.ts",
    //         templateFile:
    //             "plop-templates/core/application/features/base/responses/base-query.response.hbs",
    //     },
    // ];
    //
    // const generateException = [
    //     {
    //         type: "add",
    //         path: "src/core/domain/{{dasherize group}}/{{dasherize name}}.exception.ts",
    //         templateFile: "plop-templates/core/domain/exceptions/base.exception.hbs",
    //     },
    // ];
    //
    // const generateDto = [
    //     {
    //         type: "add",
    //         path: "src/infrastructure/directus-endpoints-adapter/{{dasherize group}}/dtos/{{dasherize name}}.dto.ts",
    //         templateFile:
    //             "plop-templates/infrastructure/directus-endpoints-adapter/dtos/base.dto.hbs",
    //     },
    // ];
    //
    // const generateCommandDto = [
    //     {
    //         type: "add",
    //         path: "src/infrastructure/directus-endpoints-adapter/{{dasherize group}}/dtos/{{dasherize name}}-command.dto.ts",
    //         templateFile:
    //             "plop-templates/infrastructure/directus-endpoints-adapter/dtos/base-command.dto.hbs",
    //     },
    // ];
    //
    // const generateQueryDto = [
    //     {
    //         type: "add",
    //         path: "src/infrastructure/directus-endpoints-adapter/{{dasherize group}}/dtos/{{dasherize name}}-query.dto.ts",
    //         templateFile:
    //             "plop-templates/infrastructure/directus-endpoints-adapter/dtos/base-query.dto.hbs",
    //     },
    // ];

    plop.setGenerator("page:full", {
        description: "Generate refine resource pages",
        prompts: groupPrompts,
        actions: [
            ...generateCreateResourcePage,
            ...generateEditResourcePage,
            ...generateListResourcesPage,
            ...generateShowResourcePage,
            ...generateResourcePageIndex
        ],
    });

    plop.setGenerator("page:create", {
        description: "Generate create resource page",
        prompts: groupPrompts,
        actions: generateCreateResourcePage,
    });

    plop.setGenerator("page:edit", {
        description: "Generate edit resource page",
        prompts: groupPrompts,
        actions: generateEditResourcePage,
    });

    plop.setGenerator("page:list", {
        description: "Generate list resources page",
        prompts: groupPrompts,
        actions: generateListResourcesPage,
    });

    plop.setGenerator("page:show", {
        description: "Generate show resource page",
        prompts: groupPrompts,
        actions: generateListResourcesPage,
    });

    // plop.setGenerator("core:model", {
    //     description: "Generate model",
    //     prompts: groupPrompts,
    //     actions: generateModel,
    // });
    //
    // plop.setGenerator("core:repository", {
    //     description: "Generate repository port",
    //     prompts: groupPrompts,
    //     actions: generateRepositoryPort,
    // });
    //
    // plop.setGenerator("core:service", {
    //     description: "Generate service port",
    //     prompts: groupPrompts,
    //     actions: generateServicePort,
    // });
    //
    // plop.setGenerator("core:exception", {
    //     description: "Generate exception",
    //     prompts: groupPrompts,
    //     actions: generateException,
    // });
    //
    // plop.setGenerator("app:query", {
    //     description: "Generate query",
    //     prompts: groupPrompts,
    //     actions: [...generateQuery, ...generateQueryDto],
    // });
    //
    // plop.setGenerator("app:command", {
    //     description: "Generate command",
    //     prompts: groupPrompts,
    //     actions: [...generateCommand, ...generateCommandDto],
    // });
    //
    // plop.setGenerator("infra:repository", {
    //     description: "Generate repository",
    //     prompts: groupPrompts,
    //     actions: [...generateRepositoryPort, ...generateRepository],
    // });
    //
    // plop.setGenerator("infra:service", {
    //     description: "Generate service",
    //     prompts: groupPrompts,
    //     actions: [...generateServicePort, ...generateService],
    // });
    //
    // plop.setGenerator("infra:dto", {
    //     description: "Generate dto",
    //     prompts: groupPrompts,
    //     actions: generateDto,
    // });
    //
    // plop.setGenerator("infra:endpoint", {
    //     description: "Generate endpoint",
    //     prompts: groupPrompts,
    //     actions: generateEndpoint,
    // });
    //
    // plop.setGenerator("crud:entity", {
    //     description: "Generate CRUD en",
    //     prompts: groupPrompts,
    //     actions: [
    //         ...generateModel,
    //         ...generateRepositoryPort,
    //         ...generateRepository,
    //     ],
    // });
    //
    // plop.setGenerator("crud:endpoint", {
    //     description: "Generate CRUD endpoint",
    //     prompts: groupPrompts,
    //     actions: [...generateEndpoint],
    // });
    //
    // plop.setGenerator("crud:entity_and_endpoint", {
    //     description: "Generate CRUD endpoint",
    //     prompts: groupPrompts,
    //     actions: [
    //         ...generateModel,
    //         ...generateRepositoryPort,
    //         ...generateRepository,
    //         ...generateEndpoint,
    //     ],
    // });

};
