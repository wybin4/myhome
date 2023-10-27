import { GenericEnumTransformer } from '@myhome/constants';
import { IVoting, VotingStatus } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('votings')
export class VotingEntity implements IVoting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    houseId: number;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    createdAt: Date;

    @Column({ nullable: false })
    expiredAt: Date;

    @Column({
        nullable: false,
        type: 'varchar',
        transformer: GenericEnumTransformer(VotingStatus),
        default: VotingStatus.Open,
    })
    status: VotingStatus;

    constructor(data?: Partial<VotingEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            houseId: this.houseId,
            title: this.title,
            createdAt: this.createdAt,
            expiredAt: this.expiredAt,
            status: this.status
        }
    }

}