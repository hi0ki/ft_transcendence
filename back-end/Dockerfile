FROM node:20-alpine

RUN apk add bash

ARG app_name

WORKDIR /app

#from app_name
COPY ${app_name}/ /app

RUN npm install

EXPOSE 3000

CMD [ "npm" , "run", "start" ]