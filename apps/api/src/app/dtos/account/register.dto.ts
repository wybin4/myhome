import { UserRole } from '@myhome/interfaces';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEnum(UserRole)
  userRole!: UserRole;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  checkingAccount?: string;

  @IsEnum(UserRole)
  registerRole!: UserRole;
}
