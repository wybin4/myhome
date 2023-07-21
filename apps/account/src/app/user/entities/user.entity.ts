import { IUser, UserRole, UserRoleEnumTransformer } from '@myhome/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Users implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ nullable: true })
  checkingAccount: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Owner,
    transformer: UserRoleEnumTransformer,
  })
  role: UserRole;

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
      role: this.role,
      name: this.name
    }
  }
}
