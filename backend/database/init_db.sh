#!/bin/bash

set -eof pipefail

npm install

#run prisma migrate
if [ -d "./prisma/migrations" ]; then
    echo "Applying Prisma migrations..."
    npx prisma migrate deploy
else
    echo "No migrations found, creating initial migration..."
    npx prisma migrate dev --name init --create-only
fi