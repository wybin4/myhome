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
  checkingAccount?: string;
  link?: string;
}

export type IGetUser = Omit<IUser, 'passwordHash'>;