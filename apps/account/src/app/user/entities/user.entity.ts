import { IUser, UserRole } from '@myhome/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  id?: number;
  name?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  checkingAcount?: string;

  constructor(user: IUser) {
    this.id = user.id;
    this.passwordHash = user.passwordHash;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.checkingAcount = user.checkingAcount;
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  public async updateProfile(name: string) {
    this.name = name;
    return this;
  }

  public getPublicProfile() {
    return {
      email: this.email,
      role: this.role,
      name: this.name
    }
  }
}
