import { Injectable } from "@nestjs/common";
import { VotingRepository } from "./repositories/voting.repository";
import { AddVoting, GetVoting, GetVotingsByMCId, ReferenceGetHouse, ReferenceGetHousesByMCId } from "@myhome/contracts";
import { HOUSES_NOT_EXIST, OPTIONS_NOT_EXIST, OPTION_NOT_EXIST, RMQException, VOTINGS_FOR_MC_NOT_EXIST, VOTING_NOT_EXIST } from '@myhome/constants';
import { VotingEntity } from "./entities/voting.entity";
import { RMQService } from "nestjs-rmq";
import { OptionEntity } from "./entities/option.entity";
import { OptionRepository } from "./repositories/option.repository";
import { VotingStatus } from "@myhome/interfaces";

@Injectable()
export class VotingService {
    constructor(
        private readonly votingRepository: VotingRepository,
        private readonly optionRepository: OptionRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async addVoting(dto: AddVoting.Request): Promise<AddVoting.Response> {
        await this.getHouse(dto.houseId);
        const newVotingEntity = new VotingEntity(dto);
        const newVoting = await this.votingRepository.create(newVotingEntity);

        const options: OptionEntity[] = dto.options.map(option => {
            const entity = new OptionEntity({
                ...option,
                votingId: newVoting.id // обогащаем каждый option votingId
            });
            return entity;
        });
        const newOptions = await this.optionRepository.createMany(options);

        return { voting: newVoting, options: newOptions };
    }

    public async updateVoting(optionId: number) {
        const existedOption = await this.optionRepository.findById(optionId);
        if (!existedOption) {
            throw new RMQException(OPTION_NOT_EXIST.message, OPTION_NOT_EXIST.status);
        }
        const optionEntity = new OptionEntity(existedOption).updateOption();
        return Promise.all([
            this.optionRepository.update(await optionEntity),
        ]);
    }

    public async getVoting(id: number): Promise<GetVoting.Response> {
        const voting = await this.votingRepository.findById(id);
        if (!voting) {
            throw new RMQException(VOTING_NOT_EXIST.message(id), VOTING_NOT_EXIST.status);
        }
        const gettedVoting = new VotingEntity(voting).get();

        const options = await this.optionRepository.findByVotingId(id);
        if (!options) {
            throw new RMQException(OPTIONS_NOT_EXIST.message(id), OPTIONS_NOT_EXIST.status);
        }
        const gettedOptions = options.map(option => new OptionEntity(option).get());

        return { voting: gettedVoting, options: gettedOptions };
    }

    async getVotingsByMCId(managementCompanyId: number): Promise<GetVotingsByMCId.Response> {
        const { houses } = await this.getHousesByMCId(managementCompanyId);
        if (!houses) {
            throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
        }
        const houseIds = houses.map(h => h.id);
        const votings = await this.votingRepository.findVotingsByHouseIds(houseIds);
        if (!votings.length) {
            throw new RMQException(VOTINGS_FOR_MC_NOT_EXIST.message(managementCompanyId), VOTINGS_FOR_MC_NOT_EXIST.status);
        }

        const votingIds = votings.map(obj => obj.id);
        const options = await this.optionRepository.findByVotingIds(votingIds);
        if (!options) {
            throw new RMQException(OPTION_NOT_EXIST.message, OPTION_NOT_EXIST.status);
        }

        return {
            votings: votings.map(voting => {
                const currentOptions = options.filter(opt => opt.votingId === voting.id);
                let result: OptionEntity | undefined;
                if (voting.status === VotingStatus.Close) {
                    result = currentOptions.reduce((max, obj) => (obj.numberOfVotes > max.numberOfVotes ? obj : max), currentOptions[0]);
                } else result = undefined;
                return {
                    result: result ? result.text : undefined,
                    ...voting
                };
            })
        };
    }

    private async getHousesByMCId(managementCompanyId: number) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetHousesByMCId.Request,
                    ReferenceGetHousesByMCId.Response
                >
                (ReferenceGetHousesByMCId.topic, { managementCompanyId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async getHouse(houseId: number) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetHouse.Request,
                    ReferenceGetHouse.Response
                >
                (ReferenceGetHouse.topic, { id: houseId });
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }
}