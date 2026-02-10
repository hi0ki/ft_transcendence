#!/bin/bash

set -eof pipefail

cd /database

until pg_isready; do
  echo "Waiting for Postgres to start..."
  sleep 2
done

echo "Postgres started"

npm install

#run prisma migrate
if [ -d "./prisma/migrations" ]; then
    echo "Applying Prisma migrations..."
    npx prisma migrate deploy
else
    echo "No migrations found, creating initial migration..."
    npx prisma migrate dev --name init --create-only
fi