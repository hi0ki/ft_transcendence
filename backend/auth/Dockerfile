FROM node:20-alpine

WORKDIR /app

# Prisma requirements
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    postgresql-client \
    netcat-openbsd

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma client INSIDE Alpine
RUN npx prisma generate

CMD ["sh", "run-prisma.sh"]
