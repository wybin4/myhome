import { IOption } from '@myhome/interfaces';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('options')
export class OptionEntity implements IOption {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    votingId: number;

    @Column({ nullable: false })
    text: string;

    @Column({ nullable: true })
    numberOfVotes?: number;

    constructor(data?: Partial<OptionEntity>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public get() {
        return {
            votingId: this.votingId,
            text: this.text,
            numberOfVotes: this.numberOfVotes,
        }
    }

    async updateOption() {
        this.numberOfVotes++;
        return this;
    }
}