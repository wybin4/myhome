import { Module } from '@nestjs/common';
import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admins, ManagementCompanies, Owners } from './entities/user.entity';
import { AdminRepository } from './repositories/admin.repository';
import { ManagementCompanyRepository } from './repositories/management-company.repository';
import { OwnerRepository } from './repositories/owner.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admins, Owners, ManagementCompanies]),
  ],
  providers: [AdminRepository, OwnerRepository, ManagementCompanyRepository, UserService],
  exports: [AdminRepository, OwnerRepository, ManagementCompanyRepository],
  controllers: [UserCommands, UserQueries],
})
export class UserModule { }
