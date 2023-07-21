import { Module } from '@nestjs/common';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admins, ManagementCompanies, Owners, Users } from './entities/user.entity';
import { AdminRepository } from './repositories/admin.repository';
import { ManagementCompanyRepository } from './repositories/management-company.repository';
import { OwnerRepository } from './repositories/owner.repository';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admins, Owners, ManagementCompanies]),
  ], 
  // imports: [
  //   TypeOrmModule.forFeature([Users]),
  // ],
  // providers: [AdminRepository, OwnerRepository, ManagementCompanyRepository, UserService],
  // // exports: [AdminRepository, OwnerRepository, ManagementCompanyRepository],
  // exports: [UserRepository],
  controllers: [UserCommands, UserQueries],
})
export class UserModule { }
