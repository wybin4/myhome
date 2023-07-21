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
    TypeOrmModule.forFeature([Users, Admins, Owners, ManagementCompanies]),
  ],
  providers: [UserRepository, AdminRepository, OwnerRepository, ManagementCompanyRepository, UserService],
  exports: [UserRepository, AdminRepository, OwnerRepository, ManagementCompanyRepository],
  controllers: [UserCommands, UserQueries],
})
export class UserModule { }
