FROM node:20-alpine as build
WORKDIR /opt/app
ADD *.json ./
RUN npm install
RUN npm i webpack
ADD . .
RUN npm run build payment
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine
COPY --from=build /opt/app/dist/apps/payment ./dist
COPY --from=build /opt/app/node_modules ./node_modules
CMD [ "node", "./dist/main.js" ]