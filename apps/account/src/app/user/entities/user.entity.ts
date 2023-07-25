import { IUser } from '@myhome/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export class UserEnitity implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordHash: string;

  constructor(data?: Partial<UserEnitity>) {
    if (data) {
      Object.assign(this, data);
    }
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
      name: this.name
    }
  }
}

@Entity('admins')
export class Admins extends UserEnitity { }

@Entity('owners')
export class Owners extends UserEnitity { }

@Entity('management_companies')
export class ManagementCompanies extends UserEnitity {
  @Column({ nullable: true })
  checkingAccount: string;

  public getPublicProfile() {
    return {
      email: this.email,
      name: this.name,
      checkingAccount: this.checkingAccount
    }
  }
}
