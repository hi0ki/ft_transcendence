#!/bin/sh
set -e

echo "Pushing Prisma schema to database..."
npx prisma db push --accept-data-loss

npx prisma generate

npm run start
