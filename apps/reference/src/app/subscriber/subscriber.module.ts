import { Module } from '@nestjs/common';
import { HouseController } from './controllers/house.controller';
import { HouseRepository } from './repositories/house.repository';
import { HouseEntity } from './entities/house.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApartmentEntity } from './entities/apartment.entity';
import { ApartmentRepository } from './repositories/apartment.repository';
import { ApartmentController } from './controllers/apartment.controller';
import { SubscriberEntity } from './entities/subscriber.entity';
import { SubscriberRepository } from './repositories/subscriber.repository';
import { SubscriberController } from './controllers/subscriber.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([HouseEntity, ApartmentEntity, SubscriberEntity]),
  ],
  providers: [HouseRepository, ApartmentRepository, SubscriberRepository],
  exports: [HouseRepository, ApartmentRepository, SubscriberRepository],
  controllers: [HouseController, ApartmentController, SubscriberController],
})
export class SubscriberModule { }
