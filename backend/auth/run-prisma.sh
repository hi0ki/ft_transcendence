#!/bin/sh
set -e

if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations)" ]; then
    echo "Applying Prisma migrations..."
    npx prisma migrate deploy
else
    echo "No migrations found, pushing schema..."
    npx prisma db push
fi

npx prisma generate

npm run start
