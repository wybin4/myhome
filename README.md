# myhome

Запуск всех сервисов - `nx run-many --target=serve --all --parallel=10`
Отдельный запуск сервиса `nx run reference:serve:development`, `nx run account:serve:development` или `nx run api:serve:development`
docker-compose.yml для rmq:
`
version: '3.1'
services:
  rmq:
    image: rabbitmq:3-management
    restart: always
    ports: 
      - "15672:15672"
      - "5672:5672"
`
Поднять его можно `docker-compose up -d` в папке с файлом
