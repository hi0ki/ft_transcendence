FROM node:20-bullseye

RUN apt-get update

COPY . /app

WORKDIR /app

RUN npm install

CMD ["npm", "run", "dev" ]