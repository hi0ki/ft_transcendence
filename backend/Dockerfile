FROM node:20-alpine

RUN apk add bash

ARG app_name

WORKDIR /app

COPY ${app_name}/package*.json .

RUN npm install

COPY ${app_name}/ .

EXPOSE 3000

CMD [ "npm" , "run", "start" ]