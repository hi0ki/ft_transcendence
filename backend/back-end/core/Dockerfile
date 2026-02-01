FROM node:20-alpine

RUN apk add bash

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD [ "npm" , "run", "start" ]
