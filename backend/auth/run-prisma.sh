#!/bin/sh
set -e

echo "Pushing Prisma schema to database..."
npx prisma db push --accept-data-loss

npx prisma generate

mkdir -p /app/ssl

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout /app/ssl/key.pem \
-out /app/ssl/cert.pem \
-subj "/C=MA/ST=Casablanca/L=Casablanca/O=42/OU=Student/CN=auth_service"

npm run start
