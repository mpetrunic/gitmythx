FROM node:carbon-alpine

RUN apk add --update  git build-base libgit2-dev make python curl-dev g++  && \
  rm -rf /tmp/* /var/cache/apk/*

RUN ln -s /usr/lib/libcurl.so.4 /usr/lib/libcurl-gnutls.so.4

WORKDIR /usr/app

# Install node dependencies - done in a separate step so Docker can cache it.
COPY yarn.lock .
COPY package.json .

RUN BUILD_ONLY=true yarn install --frozen-lockfile && yarn cache clean

COPY . .

RUN yarn run compile

RUN chown -R node: .

USER node
