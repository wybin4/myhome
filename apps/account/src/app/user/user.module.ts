import { Module } from '@nestjs/common';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity, ManagementCompanyEntity, OwnerEntity } from './user.entity';
import { AdminRepository, OwnerRepository, ManagementCompanyRepository } from './user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminEntity, OwnerEntity, ManagementCompanyEntity]),
  ],
  providers: [AdminRepository, OwnerRepository, ManagementCompanyRepository, UserService],
  exports: [AdminRepository, OwnerRepository, ManagementCompanyRepository],
  controllers: [UserCommands, UserQueries],
})
export class UserModule { }
