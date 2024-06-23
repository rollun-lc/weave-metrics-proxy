FROM node:16

WORKDIR /usr/src/app

COPY . .

EXPOSE 80

USER root

ENTRYPOINT [ "node", "main.js"]