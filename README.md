# myhome

docker-compose.yml для rmq:
```
version: '3.1'
services:
  rmq:
    image: rabbitmq:3-management
    restart: always
    ports: 
      - "15672:15672"
      - "5672:5672"
```
docker-compose.yml для mongo:
```
version: '3'
services:
  mongo:
    image: mongo:4.4.4
    container_name: mongo
    restart: always
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=admin
    ports:
      - 27017:27017
    volumes:
      - ./mongo-data-4.4:/data/db
```
Поднять docker-compose.yml можно `docker-compose up -d` в папке с файлом

Требования к nodejs: node-16

Запуск проекта:
1. `git clone https://github.com/wybin4/myhome.git`
2. `npm install --save-dev @nrwl/nest`
3. copy folder envs.exmaple to envs folder
4. `nx run [any]:serve:development`

Запуск всех сервисов - `nx run-many --target=serve --all --parallel=10`

Отдельный запуск сервиса `nx run reference:serve:development`, `nx run account:serve:development` или `nx run api:serve:development`
