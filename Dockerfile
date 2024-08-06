 ###################
 # CONFIGURATION
 ###################

ARG NODE_VERSION=20.12.2
ARG NGINX_VERSION=latest


###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:${NODE_VERSION} As builder
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm config set registry http://r.cnpmjs.org
RUN npm i --force
COPY . ./
RUN npm run build



###################
# DEPLOY
###################


FROM nginx:${NGINX_VERSION}
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]