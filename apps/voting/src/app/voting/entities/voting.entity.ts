import { IVoting } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('votings')
export class VotingEntity implements IVoting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    managementCompanyId: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    createdAt: Date;

    @Column({ nullable: false })
    expiredAt: Date;

    constructor(data?: Partial<VotingEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            managementCompanyId: this.managementCompanyId,
            title: this.title,
            createdAt: this.createdAt,
            expiredAt: this.expiredAt
        }
    }

}