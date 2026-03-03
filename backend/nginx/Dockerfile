FROM nginx:stable-alpine

RUN apk add bash openssl

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443

COPY setup_ssl.sh .

RUN chmod +x /setup_ssl.sh

CMD ["sh", "/setup_ssl.sh"]