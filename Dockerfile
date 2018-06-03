FROM node:alpine
LABEL maintainer="balazs4web@gmail.com"
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
COPY . /app
WORKDIR /app
RUN ["yarn", "install", "--production"]
EXPOSE 3000
CMD ["yarn", "start"]
