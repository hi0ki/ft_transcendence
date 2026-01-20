FROM postgres:15-alpine

RUN apk add bash npm

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=ft_transc

COPY . /database
COPY init_db.sh /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/init_db.sh

WORKDIR /database

EXPOSE 5432

# RUN [ "/docker-entrypoint-initdb.d/init_db.sh" ] // runni script bchi tari9a hihihih
