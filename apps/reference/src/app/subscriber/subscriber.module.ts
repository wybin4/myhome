import { Module } from '@nestjs/common';
import { HouseController } from './controllers/house.controller';
import { HouseRepository } from './repositories/house.repository';
import { Houses } from './entities/house.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Houses]),
  ],
  providers: [HouseRepository],
  exports: [HouseRepository],
  controllers: [HouseController],
})
export class SubscriberModule { }
