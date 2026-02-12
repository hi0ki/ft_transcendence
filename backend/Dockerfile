FROM node:20-slim

RUN apt update

ARG app_name

WORKDIR /app

COPY ${app_name}/package*.json .

RUN npm install

COPY ${app_name}/ .

CMD [ "npm" , "run", "start" ]