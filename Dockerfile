FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /usr/src/app

COPY . .

EXPOSE 80

CMD ["main.js"]