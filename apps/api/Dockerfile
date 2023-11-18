FROM node:16-alpine as build
WORKDIR /opt/app
ADD *.json .
RUN npm install --legacy-peer-deps
ADD . .
RUN npm run build api

FROM node:16-alpine as build
WORKDIR /opt/app
ADD package.json ./
RUN npm install --legacy-peer-deps --only=prod
COPY --from=build /opt/app/dist/apps/api ./dist
CMD ["node", "./dist/main.js"]