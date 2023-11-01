import { RMQException, OPTION_NOT_EXIST, INCORRECT_USER_ROLE, HOUSES_NOT_EXIST, VOTINGS_NOT_EXIST } from "@myhome/constants";
import { EventAddVoting } from "@myhome/contracts";
import { UserRole, IGetVoting, IHouse, VotingStatus } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { getHouse, getHouseByOId, getHousesByMCId } from "../constants";
import { OptionEntity } from "./entities/option.entity";
import { VotingEntity } from "./entities/voting.entity";
import { OptionRepository } from "./repositories/option.repository";
import { VotingRepository } from "./repositories/voting.repository";

@Injectable()
export class VotingService {
    constructor(
        private readonly votingRepository: VotingRepository,
        private readonly optionRepository: OptionRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async addVoting(dto: EventAddVoting.Request): Promise<EventAddVoting.Response> {
        await getHouse(this.rmqService, dto.houseId);
        const newVotingEntity = new VotingEntity(dto);
        const newVoting = await this.votingRepository.create(newVotingEntity);

        const options: OptionEntity[] = dto.options.map(option => {
            const entity = new OptionEntity({
                text: option,
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

    async getVotings(userId: number, userRole: UserRole): Promise<{ votings: IGetVoting[] }> {
        let houses: IHouse[];
        switch (userRole) {
            case UserRole.Owner:
                ({ houses } = await getHouseByOId(this.rmqService, userId));
                break;
            case UserRole.ManagementCompany:
                ({ houses } = await getHousesByMCId(this.rmqService, userId));
                break;
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }

        if (!houses) {
            throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
        }
        const houseIds = houses.map(h => h.id);
        const votings = await this.votingRepository.findVotingsByHouseIds(houseIds);
        if (!votings.length) {
            throw new RMQException(VOTINGS_NOT_EXIST.message(userId), VOTINGS_NOT_EXIST.status);
        }

        const votingIds = votings.map(obj => obj.id);
        const options = await this.optionRepository.findByVotingIds(votingIds);
        if (!options) {
            throw new RMQException(OPTION_NOT_EXIST.message, OPTION_NOT_EXIST.status);
        }

        return {
            votings: votings.map(voting => {
                const currentOptions = options.filter(opt => opt.votingId === voting.id);
                const currentHouse = houses.find(house => house.id === voting.houseId);
                let result: OptionEntity | undefined;
                if (voting.status === VotingStatus.Close) {
                    result = currentOptions.reduce((max, obj) => (obj.numberOfVotes > max.numberOfVotes ? obj : max), currentOptions[0]);
                } else result = undefined;
                return {
                    houseName: `${currentHouse.city}, ${currentHouse.street} ${currentHouse.houseNumber}`,
                    result: result ? result.text : undefined,
                    ...voting
                };
            })
        };
    }

}