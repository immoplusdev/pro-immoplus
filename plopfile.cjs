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

    plop.setHelper("timestampify", () => moment().format("YYYYMMDDHHmmss"));

    const namePrompt = [
        {
            type: "input",
            name: "name",
            message: "entity name",
        },
    ];

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


    const patternPrompts = [
        ...groupPrompts,
        {
            type: "input",
            name: "pattern",
            message: "pattern name",
        },
    ];

    const generateModel = [
        {
            type: "add",
            path: "src/core/domain/{{dasherize group}}/{{dasherize name}}.model.ts",
            templateFile: "plop-templates/core/domain/base/base.model.hbs",
        },
    ];

    const generateInterface = [
        {
            type: "add",
            path: "src/core/domain/{{dasherize group}}/i-{{dasherize name}}.ts",
            templateFile: "plop-templates/core/domain/base/i-base.hbs",
        },
    ];

    const generateEnum = [
        {
            type: "add",
            path: "src/core/domain/{{dasherize group}}/{{dasherize name}}.enum.ts",
            templateFile: "plop-templates/core/domain/base/base.enum.hbs",
        },
    ];

    const generateRepositoryPort = [
        {
            type: "add",
            path: "src/core/domain/{{dasherize group}}/i-{{dasherize name}}.repository.ts",
            templateFile:
                "plop-templates/core/domain/base/i-base.repository.hbs",
        },
    ];

    const generateServicePort = [
        {
            type: "add",
            path: "src/core/domain/{{dasherize group}}/i-{{dasherize name}}.service.ts",
            templateFile:
                "plop-templates/core/domain/base/i-base.service.hbs",
        },
    ];

    const generateRepository = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/{{dasherize name}}.repository.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/base.repository.hbs",
        },
    ];

    const generateService = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/{{dasherize name}}.service.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/base.service.hbs",
        },
    ];

    const generateEntity = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/{{dasherize name}}.entity.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/base.entity.hbs",
        },
    ];

    const generateDomainExporter = [
        {
            type: "add",
            path: "src/core/domain/{{dasherize group}}/index.ts",
            templateFile:
                "plop-templates/core/domain/base/index.hbs",
        },
    ];

    const generateInfraExporter = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/index.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/index.hbs",
        },
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/dto/index.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/dto/index.hbs",
        },
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/{{dasherize name}}.module.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/base.module.hbs",
        },

    ];

    const generateController = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/{{dasherize name}}.controller.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/base.controller.hbs",
        },
    ];

    const generateMigration = [
        {
            type: "add",
            path: "src/infrastructure/db/migrations/{{dasherize name}}-{{timestampify}}.migration.ts",
            templateFile:
                "plop-templates/infrastructure/db/migrations/base.hbs",
        },
    ];

    const generateCommand = [
        {
            type: "add",
            path: "src/core/application/features/{{dasherize group}}/{{dasherize name}}.command.ts",
            templateFile:
                "plop-templates/core/application/features/base/base.command.hbs",
        },
        {
            type: "add",
            path: "src/core/application/features/{{dasherize group}}/{{dasherize name}}-command.handler.ts",
            templateFile:
                "plop-templates/core/application/features/base/base-command.handler.hbs",
        },
        {
            type: "add",
            path: "src/core/application/features/{{dasherize group}}/{{dasherize name}}-command.response.ts",
            templateFile:
                "plop-templates/core/application/features/base/base-command.response.hbs",
        },
    ];

    const generateQuery = [
        {
            type: "add",
            path: "src/core/application/features/{{dasherize group}}/{{dasherize name}}.query.ts",
            templateFile:
                "plop-templates/core/application/features/base/base.query.hbs",
        },
        {
            type: "add",
            path: "src/core/application/features/{{dasherize group}}/{{dasherize name}}-query.handler.ts",
            templateFile:
                "plop-templates/core/application/features/base/base-query.handler.hbs",
        },
        {
            type: "add",
            path: "src/core/application/features/{{dasherize group}}/{{dasherize name}}-query.response.ts",
            templateFile:
                "plop-templates/core/application/features/base/base-query.response.hbs",
        },
    ];

    const generateException = [
        {
            type: "add",
            path: "src/core/domain/{{dasherize group}}/{{dasherize name}}.exception.ts",
            templateFile: "plop-templates/core/domain/base/base.exception.hbs",
        },
    ];

    const generateDto = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/dto/{{dasherize name}}.dto.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/dto/base.dto.hbs",
        },
    ];

    const generateDtoMapper = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/dto/{{dasherize name}}-dto.mapper.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/dto/base-dto.mapper.hbs",
        },
    ];

    const generateCUDto = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/dto/create-{{dasherize name}}.dto.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/dto/create-base.dto.hbs",
        },
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/dto/update-{{dasherize name}}.dto.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/dto/update-base.dto.hbs",
        },
    ];

    const generateCommandDto = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/dto/{{dasherize name}}-command.dto.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/dto/base-command.dto.hbs",
        },
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/dto/{{dasherize name}}-command-response.dto.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/dto/base-command-response.dto.hbs",
        },
    ];

    const generateQueryDto = [
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/dto/{{dasherize name}}-query.dto.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/dto/base-query.dto.hbs",
        },
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/dto/{{dasherize name}}-query-response.dto.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/dto/base-query-response.dto.hbs",
        },
    ];

    const generatePattern = [
        {
            type: "add",
            path: "src/core/domain/{{dasherize group}}/i-{{dasherize name}}.{{dasherizeSingular pattern}}.ts",
            templateFile: "plop-templates/core/domain/base/i-base-pattern.hbs",
        },
        {
            type: "add",
            path: "src/infrastructure/features/{{dasherize group}}/{{dasherize name}}.{{dasherizeSingular pattern}}.ts",
            templateFile:
                "plop-templates/infrastructure/features/base/base.pattern.hbs",
        },
    ];

    plop.setGenerator("page:all", {
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

    plop.setGenerator("core:model", {
        description: "Generate model",
        prompts: groupPrompts,
        actions: generateModel,
    });

    plop.setGenerator("core:interface", {
        description: "Generate interface",
        prompts: groupPrompts,
        actions: generateInterface,
    });

    plop.setGenerator("core:enum", {
        description: "Generate enum",
        prompts: groupPrompts,
        actions: generateEnum,
    });

    plop.setGenerator("core:repository", {
        description: "Generate repository port",
        prompts: groupPrompts,
        actions: generateRepositoryPort,
    });

    plop.setGenerator("core:service", {
        description: "Generate service port",
        prompts: groupPrompts,
        actions: generateServicePort,
    });

    plop.setGenerator("core:exception", {
        description: "Generate exception",
        prompts: groupPrompts,
        actions: generateException,
    });

    plop.setGenerator("app:query", {
        description: "Generate query",
        prompts: groupPrompts,
        actions: [...generateQuery, ...generateQueryDto],
    });

    plop.setGenerator("app:command", {
        description: "Generate command",
        prompts: groupPrompts,
        actions: [...generateCommand, ...generateCommandDto],
    });

    plop.setGenerator("infra:repository", {
        description: "Generate repository",
        prompts: groupPrompts,
        actions: [...generateRepositoryPort, ...generateRepository],
    });

    plop.setGenerator("infra:service", {
        description: "Generate service",
        prompts: groupPrompts,
        actions: [...generateServicePort, ...generateService],
    });

    plop.setGenerator("infra:dto", {
        description: "Generate dto",
        prompts: groupPrompts,
        actions: generateDto,
    });

    plop.setGenerator("infra:cu-dto", {
        description: "Generate CU dto",
        prompts: groupPrompts,
        actions: generateCUDto,
    });

    plop.setGenerator("infra:mapper", {
        description: "Generate dto mapper",
        prompts: groupPrompts,
        actions: generateDtoMapper,
    });

    plop.setGenerator("infra:controller", {
        description: "Generate controller",
        prompts: groupPrompts,
        actions: generateController,
    });

    plop.setGenerator("infra:pattern", {
        description: "Generate pattern implementation",
        prompts: patternPrompts,
        actions: generatePattern,
    });

    plop.setGenerator("infra:entity", {
        description: "Generate Typeorm entity",
        prompts: groupPrompts,
        actions: [
            ...generateModel,
            ...generateEntity,
            ...generateRepositoryPort,
            ...generateRepository,
        ],
    });

    plop.setGenerator("infra:controller", {
        description: "Generate Rest endpoint",
        prompts: groupPrompts,
        actions: [...generateController],
    });

    plop.setGenerator("infra:entity_and_controller", {
        description: "Generate CRUD endpoint",
        prompts: groupPrompts,
        actions: [
            ...generateModel,
            ...generateEntity,
            ...generateDto,
            ...generateCUDto,
            ...generateDtoMapper,
            ...generateRepositoryPort,
            ...generateRepository,
            ...generateController,
            ...generateDomainExporter,
            ...generateInfraExporter,
        ],
    });

    plop.setGenerator("db:migration", {
        description: "Generate DB migration",
        prompts: namePrompt,
        actions: [
            ...generateMigration,
        ],
    });

};
