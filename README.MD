# Immoplus Admin

This Project is the main admin for immoplus app

## Getting Started

Make sure that you have `node 20` or ealier installed on your local machine. Once all requirements are met, follow the following procedure to run the project locally:

- Make sure create create a `.env` file in the root directory of the project. Put the content in the `.env.example` in your new file.

- Run

```bash
    npm install --force
```

in the root directory in order to install the project dependencies

- Run

```bash
    npm run dev
```

to start the development server.

## Available Scripts

### Running the development server.

```bash
    npm run dev
```

### Building for production.

```bash
    npm run build
```

### Running the production server.

```bash
    npm run start
```

## Learn More About Refine

To learn more about **Refine**, please check out the [Documentation](https://refine.dev/docs)

- **REST Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)
- **Ant Design** [Docs](https://refine.dev/docs/ui-frameworks/antd/tutorial/)
- **Inferencer** [Docs](https://refine.dev/docs/packages/documentation/inferencer)
- **Custom Auth Provider** [Docs](https://refine.dev/docs/core/providers/auth-provider/)
- **i18n** [Docs](https://refine.dev/docs/core/providers/i18n-provider/)
- **React Router** [Docs](https://refine.dev/docs/core/providers/router-provider/)

## Folder Structure
- The `components` directory contains all the components shared between the different pages of our app. 
- The ``configs`` directory contains all the app configurations
- The ``core`` directory contains our business logic
    - The ``core/domain`` directory contains all the domain logic according to the DDD approach
    - The ``core/application`` directory contains a layer that connects the domain logic to the UI
- The ``lib`` directory contains all the utility functions. This includes helpers and implementation of different services defined in the domain layer.
    - ``lib/helpers`` contains all the utility functions used in the pap
    - ``lib/providers`` contains all the providers used by refined (authProvider, dataProvider...)
    - ``lib/services`` contains all the services used in the app

## Work on a functionality

- First, checkout the **dev** branch and pull the latest changes by running:
  ```bash 
    git checkout dev
  ```   

  ```bash 
    git pull
  ```   
- Create a **new branch** with the name of the functionality you are working on
    - The branch name should be prefixed according to the type of the functionality you are working on
        - ``feat`` for new features
        - ``fix`` for bug fixes
        - ``refactor`` for refactoring
        - ``chore`` for chores
        - ``docs`` for documentation
        - ``test`` for tests
    - You can get more information about how to write you commit names according to the **conventional commits** standard [here](https://www.conventionalcommits.org/en/v1.0.0/) 
    - If I'm creating the reservations functionality, I will create a branch with the name ``feat-reservations``
- Checkout the your new branch
    ```bash
    git checkout -b your-branch-name
    ```
- To create a new page, you can use the plop generators. 
    - Run  ````npx plop page:all name-of-the-resource-group name-of-the-resource```` to create a new page using  the plop package.
        - Where ``name-of-the-resource-group`` is the name of the resource group (e.g. ``residences``) and ``name-of-the-resource`` is the name of the resource (e.g. ``residences``)
        - You can keep the name in plural, the generators will automatically singularize it
        - This will create the corresponding files in the ``pages`` directory
        - It uses the refine guessers to guess the format of the api response and generate pages accordingly
        - You can use the ``Show the auto-generated code`` button on the refine dev tools widget the get a sample of the code you need to write to generate the page to ease the process of creating the page.
- When you are done, you need to create a new merge request to the **dev** branch
    - The merge request should be named according to the functionality you are working on
    - The merge request will be reviewed by the team and merged to the **dev** branch
    - Don't forget to notify the team to review your merge request if it takes longer than expected

## Deployment
- The app can be deployed with docker compose
- Make sure that you've set the environment variables in the `.env` file following the `.env.example` file
- Run the following command to deploy the app
    ```bash
    docker-compose up --build
    ```

## Useful Resources

- [API Url](https://api-v2.immoplus.ci/)
- [Swagger Doc](https://api-v2.immoplus.ci/swagger)  
- [Swagger Json](https://api-v2.immoplus.ci/swagger/json)  
- [App Preview Url](https://pro-immoplus.netlify.app)

## License

MIT
