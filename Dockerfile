FROM mhart/alpine-node:7.4.0

COPY . /app

RUN set -x \
  && apk add --no-cache --repository http://dl-4.alpinelinux.org/alpine/edge/community/ openssh autossh git \
  && cd /app \
  && npm install && npm run build \
  && rm -rf node_modules && npm install --production

WORKDIR /app

CMD ["node", "--harmony-async-await", "index.js"]
