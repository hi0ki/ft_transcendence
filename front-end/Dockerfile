FROM node:20-alpine

RUN apk add bash

COPY . /app

WORKDIR /app

RUN npm install

CMD ["npm", "run", "dev" ]