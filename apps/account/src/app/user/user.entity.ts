import { IUser } from '@myhome/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export class UserEntity implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ nullable: true })
  link?: string;

  constructor(data?: Partial<UserEntity>) {
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
      id: this.id,
      email: this.email,
      name: this.name,
    }
  }

  public getWithCheckingAccount() {
    return this.getPublicProfile();
  }

  public getLink() {
    return this.link;
  }

}

@Entity('admins')
export class AdminEntity extends UserEntity { }

@Entity('owners')
export class OwnerEntity extends UserEntity { }

@Entity('management_companies')
export class ManagementCompanyEntity extends UserEntity {
  @Column({ nullable: true })
  checkingAccount: string;

  public getPublicProfile() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      checkingAccount: this.checkingAccount
    }
  }

  public getWithCheckingAccount() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      checkingAccount: this.checkingAccount
    }
  }
}
