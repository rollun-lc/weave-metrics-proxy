FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /usr/src/app

COPY . .

EXPOSE 80

USER root

ENTRYPOINT [ "/nodejs/bin/node", "main.js"]