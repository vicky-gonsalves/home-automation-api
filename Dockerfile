FROM node:12.15-alpine

RUN mkdir -p /usr/src/home-automation-api

WORKDIR /usr/src/home-automation-api

COPY package.json yarn.lock ./

RUN yarn install --pure-lockfile

COPY . .

RUN yarn build

EXPOSE 9000
