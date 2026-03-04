#!/bin/bash
set -e

echo "=== Starting Service Setup ==="

# Create SSL directory if it doesn't exist
mkdir -p /app/ssl

# Generate SSL certificates if they don't exist
if [ ! -f /app/ssl/key.pem ] || [ ! -f /app/ssl/cert.pem ]; then
    echo "Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /app/ssl/key.pem \
    -out /app/ssl/cert.pem \
    -subj "/C=MA/ST=Casablanca/L=Casablanca/O=42/OU=Student/CN=core_service"
    echo "SSL certificates generated successfully"
else
    echo "SSL certificates already exist"
fi

npm run start
