# myhome

## Описание
Этот репозиторий содержит бэкенд-часть проекта MyHome, построенного на микросервисной архитектуре из 10 сервисов.

### `Сервисы`
- `api`
- `account`
- `reference`
- `event`
- `email`
- `chat`
- `correction`
- `document-detail`
- `single-payment-document`
- `payment`

### `Инфраструктура`
- `MySQL`
- `MongoDB`
- `RabbitMQ`
- `Redis`

## Требования
- Node >= 20
- Docker

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
docker-compose.yml для redis:
```
version: '3'
services:
  redis:
    image: redis:latest
    container_name: redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - ./redis-data:/data
```
Поднять docker-compose.yml можно `docker-compose up -d` в папке с файлом

Запуск проекта:
1. `git clone https://github.com/wybin4/myhome.git`
2. `npx nx@latest init`
3. `npm install --location=global nx @nrwl/cli`
4. copy folder envs.exmaple to envs folder
5. `nx run [any]:serve:development`

Запуск всех сервисов - `nx run-many --target=serve --all --parallel=10`

Отдельный запуск сервиса `nx run reference:serve:development`, `nx run account:serve:development` или `nx run api:serve:development`

Создание mysql-схем:
```
CREATE SCHEMA `account`;
CREATE SCHEMA `reference`;
CREATE SCHEMA `document_detail`;
CREATE SCHEMA `correction`;
CREATE SCHEMA `single_payment_document`;
CREATE SCHEMA `payment`;
CREATE SCHEMA `voting`;
CREATE SCHEMA `appeal`;
CREATE SCHEMA `notification`;
```
