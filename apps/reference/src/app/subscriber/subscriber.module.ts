import { Module } from '@nestjs/common';
import { HouseController } from './controllers/house.controller';
import { HouseRepository } from './repositories/house.repository';
import { Houses } from './entities/house.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Apartments } from './entities/apartment.entity';
import { ApartmentRepository } from './repositories/apartment.repository';
import { ApartmentController } from './controllers/apartment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Houses, Apartments]),
  ],
  providers: [HouseRepository, ApartmentRepository],
  exports: [HouseRepository, ApartmentRepository],
  controllers: [HouseController, ApartmentController],
})
export class SubscriberModule { }
