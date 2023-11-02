import { IVote } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OptionEntity } from './option.entity';

@Entity('votes')
export class VoteEntity implements IVote {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    optionId: number;

    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => OptionEntity, (option) => option.votes)
    option: OptionEntity;

    constructor(data?: Partial<VoteEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            id: this.id,
            optionId: this.optionId,
            userId: this.userId
        }
    }
}