FROM node:20-slim

RUN apt update && apt install -y curl \
    wget \
    openssl

ARG app_name

WORKDIR /app

COPY ${app_name}/package*.json .

RUN npm install

COPY ${app_name}/ .

RUN chmod +x /app/setup-service.sh

CMD ["sh", "/app/setup-service.sh"]