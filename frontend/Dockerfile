FROM node:20-alpine

RUN apk add bash

WORKDIR /app

COPY package*.json ./

RUN npm install

CMD ["npm", "run", "dev"]