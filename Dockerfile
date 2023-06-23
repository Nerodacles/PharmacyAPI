FROM node:16.20.1-bookworm-slim as base

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
RUN yarn global add serve
COPY . /
CMD ["nodemon", "bin/www"]
