###################
# BUILD STAGE
###################
FROM node:20.19.4 AS build
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . ./
RUN npm run build

###################
# DEPLOY STAGE
###################
FROM nginx:latest
WORKDIR /usr/src/app
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /etc/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]