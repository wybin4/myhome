FROM node:20-alpine as build
WORKDIR /opt/app
ADD *.json ./
RUN npm install
RUN npm i webpack
ADD . .
RUN npm run build reference
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine
WORKDIR /opt/app
COPY --from=build /opt/app/dist/apps/reference ./dist
COPY --from=build /opt/app/node_modules ./node_modules
CMD [ "node", "./dist/main.js" ]