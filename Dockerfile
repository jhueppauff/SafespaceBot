FROM node:12.21.0-alpine3.10 AS builder

WORKDIR /usr/src/bot

RUN apk add --no-cache python3 alpine-sdk

COPY ./src/yarn.lock /usr/src/bot
COPY ./src/package.json /usr/src/bot

RUN yarn

FROM node:12.21.0-alpine3.10

RUN apk add --no-cache python3

WORKDIR /usr/src/bot

COPY --from=builder /usr/src/bot/ .
COPY ./src/ .

# Start me!
CMD ["node", "index.js"]
