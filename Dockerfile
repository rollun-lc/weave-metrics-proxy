FROM node:20

WORKDIR /usr/src/app

COPY . .

EXPOSE 80

USER root

ENTRYPOINT [ "node", "main.js"]