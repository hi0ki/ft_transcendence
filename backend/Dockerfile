FROM node:20-alpine

RUN apk add bash

ARG app_name

WORKDIR /app

<<<<<<< HEAD
COPY ${app_name}/ /app

RUN npm install

=======
COPY ${app_name}/package*.json .

RUN npm install

COPY ${app_name}/ .

>>>>>>> 4f763dccc471c240ebeb5e7da1e041703eca5da7
EXPOSE 3000

CMD [ "npm" , "run", "start" ]