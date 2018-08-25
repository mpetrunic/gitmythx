FROM node:carbon-alpine

RUN apk add --virtual dependencies --update git python make g++ && \
  rm -rf /tmp/* /var/cache/apk/*

WORKDIR /usr/app

# Install node dependencies - done in a separate step so Docker can cache it.
COPY yarn.lock .
COPY package.json .

RUN yarn install --frozen-lockfile && yarn cache clean && apk del dependencies

COPY . .

RUN chown -R node: .

USER node