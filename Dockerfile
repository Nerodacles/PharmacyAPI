FROM node:16.17.0-bullseye-slim as base

ENV PATH=${PATH}

WORKDIR /src
COPY package*.json /

EXPOSE 8087

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . /
CMD ["node", "bin/www"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /
CMD ["nodemon", "bin/www"]