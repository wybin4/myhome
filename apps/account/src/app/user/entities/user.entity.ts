import { IUser } from '@myhome/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export class Users implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordHash: string;

  constructor(data?: Partial<Users>) {
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

@Entity()
export class Admins extends Users { }

@Entity()
export class Owners extends Users { }

@Entity()
export class ManagementCompanies extends Users {
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
