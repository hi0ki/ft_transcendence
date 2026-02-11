#!/bin/sh
set -e

if [ -d "./prisma/migrations" ]; then
    echo "Applying Prisma migrations..."
    npx prisma migrate deploy
else
    echo "No migrations found"
    npx prisma migrate dev --name init --create-only
fi

npm run start
