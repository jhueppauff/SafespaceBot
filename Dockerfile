FROM node:lts AS builder

WORKDIR /usr/src/bot

COPY ./src/yarn.lock /usr/src/bot
COPY ./src/package.json /usr/src/bot

RUN yarn

FROM node:lts-alpine3.13

RUN apk add --no-cache python3

WORKDIR /usr/src/bot

COPY --from=builder /usr/src/bot/ .
COPY ./src/ .

# Start me!
CMD ["node", "index.js"]
