import { IOption } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { VotingEntity } from './voting.entity';
import { VoteEntity } from './vote.entity';

@Entity('options')
export class OptionEntity implements IOption {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    votingId: number;

    @Column({ nullable: false })
    text: string;

    @ManyToOne(() => VotingEntity, (voting) => voting.options)
    voting: VotingEntity;

    @OneToMany(() => VoteEntity, (vote) => vote.option)
    votes: VoteEntity[];

    constructor(data?: Partial<OptionEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            id: this.id,
            votingId: this.votingId,
            text: this.text
        }
    }
}