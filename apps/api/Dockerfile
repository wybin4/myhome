FROM node:16-alpine as build
WORKDIR /opt/app
ADD *.json ./
RUN npm install -g npm@8.19.4
RUN npm install --legacy-peer-deps
ADD . .
RUN npm run build api

FROM node:16-alpine
WORKDIR /opt/app
ADD package.json ./
RUN npm install --only=prod --legacy-peer-deps
COPY --from=build /opt/app/dist/apps/api ./dist
CMD ["node", "./dist/main.js"]