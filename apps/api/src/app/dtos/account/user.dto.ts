import { UserRole } from '@myhome/interfaces';
import { IsNumber, IsString } from 'class-validator';

export class UserInfoDto {
    @IsNumber()
    id: number;

    @IsString()
    role: UserRole;
}

export class GetOwnersByMCIdDto {
    @IsNumber()
    managementCompanyId: number;
}
