FROM node:8.4.0-stretch

EXPOSE 3000

ENV NPM_CONFIG_LOGLEVEL error

WORKDIR /home/walt/workspace/pdf-service

RUN apt-get update && apt-get -y install chromium=59.0.3071.86-1
ENV CHROME_PATH /usr/bin/chromium

COPY yarn.lock .
COPY package.json package-lock.json ./
RUN yarn install --pure-lockfile

COPY . .

CMD [ "npm", "start" ]