import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class AdminRepository extends UserRepository {

}