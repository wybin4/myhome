import { ValueTransformer } from 'typeorm';

export enum UserRole {
  ManagementCompany = 'ManagementCompany',
  Owner = 'Owner',
  Admin = 'Admin',
}
export interface IUser {
  id?: number;
  name?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  checkingAcount?: string;
}
export const UserRoleEnumTransformer: ValueTransformer = {
  from: (value: string) => UserRole[value as keyof typeof UserRole],
  to: (value: UserRole) => value,
};