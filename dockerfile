FROM node:latest

# Create the directory!
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY ./src/. /usr/src/bot
RUN npm install

# Start me!
CMD ["node", "index.js"]