FROM node:20-alpine as build
WORKDIR /opt/app
ADD *.json ./
RUN npm install
RUN npm i webpack
ADD . .
RUN npm run build chat

FROM node:20-alpine
WORKDIR /opt/app
ADD package.json ./
RUN npm install --production
COPY --from=build /opt/app/dist/apps/chat ./dist
CMD [ "node", "./dist/main.js" ]