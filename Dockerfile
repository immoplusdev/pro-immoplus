###################
 # CONFIGURATION
 ###################
ARG NGINX_VERSION=latest

###################
# DEPLOY
###################

FROM nginx:${NGINX_VERSION}
WORKDIR /usr/src/app
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./web/* /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]