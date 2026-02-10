FROM node:20-slim

RUN apt update
RUN apt-get update && apt-get install -y \
	openssl \
	libssl-dev \
	ca-certificates \
	netcat-openbsd \
	postgresql-client \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN chmod +x run-prisma.sh
# run the script to generate prisma client and apply migrations

CMD [ "sh", "run-prisma.sh" ]