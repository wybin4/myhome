import { HttpStatus, Injectable } from "@nestjs/common";
import { VotingRepository } from "./repositories/voting.repository";
import { AddVoting, GetVoting, GetVotings, ReferenceGetManagementCompany } from "@myhome/contracts";
import { OPTIONS_NOT_EXIST, OPTION_NOT_EXIST, RMQException, SUBSCRIBER_NOT_EXIST, VOTINGS_FOR_MC_NOT_EXIST, VOTING_NOT_EXIST, checkUser } from '@myhome/constants';
import { VotingEntity } from "./entities/voting.entity";
import { RMQService } from "nestjs-rmq";
import { IVotingWithOptions, UserRole } from "@myhome/interfaces";
import { OptionEntity } from "./entities/option.entity";
import { OptionRepository } from "./repositories/option.repository";

@Injectable()
export class VotingService {
    constructor(
        private readonly votingRepository: VotingRepository,
        private readonly optionRepository: OptionRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async createVoting(dto: AddVoting.Request): Promise<AddVoting.Response> {
        const newVotingEntity = new VotingEntity(dto);
        await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
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

    public async getVotings(dto: GetVotings.Request): Promise<GetVotings.Response> {
        if (dto.subscriberId) {
            const { managementCompanyId } = await this.getMCIdBySubscriber(dto.subscriberId);
            return { votings: await this.getVotingsByMCId(managementCompanyId) };
        } else if (dto.managementCompanyId) {
            await checkUser(this.rmqService, dto.managementCompanyId, UserRole.ManagementCompany);
            return { votings: await this.getVotingsByMCId(dto.managementCompanyId) };
        }
    }

    private async getVotingsByMCId(managementCompanyId: number): Promise<IVotingWithOptions[]> {
        const votings = await this.votingRepository.findVotingsByMCId(managementCompanyId);
        if (!votings.length) {
            throw new RMQException(VOTINGS_FOR_MC_NOT_EXIST.message(managementCompanyId), VOTINGS_FOR_MC_NOT_EXIST.status);
        }

        const votingIds = votings.map(obj => obj.id);
        const options = await this.optionRepository.findByVotingIds(votingIds);
        if (!options) {
            throw new RMQException(OPTION_NOT_EXIST.message, OPTION_NOT_EXIST.status);
        }

        const gettedVotings: IVotingWithOptions[] = [];
        for (const voting of votings) {
            const gettedOptions = options.map(option => {
                if (option.votingId === voting.id) return new OptionEntity(option).get();
            });

            gettedVotings.push({
                voting: new VotingEntity(voting),
                options: gettedOptions
            });
        }
        return gettedVotings;
    }

    private async getMCIdBySubscriber(subscriberId: number) {
        try {
            return await this.rmqService.send
                <
                    ReferenceGetManagementCompany.Request,
                    ReferenceGetManagementCompany.Response
                >
                (ReferenceGetManagementCompany.topic, { subscriberId: subscriberId });
        } catch (e) {
            throw new RMQException(SUBSCRIBER_NOT_EXIST, HttpStatus.NOT_FOUND);
        }
    }
}