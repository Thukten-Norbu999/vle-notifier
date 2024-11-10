FROM mysql:latest
FROM node:latest

RUN npm install express

ENV MYSQL_ROOT_PASSWORD=root

COPY .sql /