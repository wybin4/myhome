import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
  ],
  providers: [UserRepository, UserService],
  exports: [UserRepository],
  controllers: [UserCommands, UserQueries],
})
export class UserModule { }
