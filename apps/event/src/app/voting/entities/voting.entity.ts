import { GenericEnumTransformer } from '@myhome/constants';
import { IVoting, VotingStatus } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OptionEntity } from './option.entity';

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

    @OneToMany(() => OptionEntity, (option) => option.voting)
    options: OptionEntity[];

    constructor(data?: Partial<IVoting>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            id: this.id,
            houseId: this.houseId,
            title: this.title,
            createdAt: this.createdAt,
            expiredAt: this.expiredAt,
            status: this.status
        }
    }

}