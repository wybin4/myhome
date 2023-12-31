import { RMQException, INCORRECT_USER_ROLE, HOUSES_NOT_EXIST, checkUsers, getHouseAllInfo, getHousesByOId, getHousesByMCId } from "@myhome/constants";
import { EventAddVoting, EventUpdateVoting } from "@myhome/contracts";
import { UserRole, IGetVoting, IHouse, VotingStatus, IGetOption, IMeta } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { OptionEntity } from "./entities/option.entity";
import { VotingEntity } from "./entities/voting.entity";
import { OptionRepository } from "./repositories/option.repository";
import { VotingRepository } from "./repositories/voting.repository";
import { VoteEntity } from "./entities/vote.entity";
import { VoteRepository } from "./repositories/vote.repository";

@Injectable()
export class VotingService {
    constructor(
        private readonly votingRepository: VotingRepository,
        private readonly voteRepository: VoteRepository,
        private readonly optionRepository: OptionRepository,
        private readonly rmqService: RMQService,
    ) { }

    public async addVoting(dto: EventAddVoting.Request): Promise<EventAddVoting.Response> {
        const { house } = await getHouseAllInfo(this.rmqService, dto.houseId);
        const newVotingEntity = new VotingEntity({
            ...dto,
            createdAt: new Date(),
            expiredAt: new Date(dto.expiredAt),
        });
        const newVoting = await this.votingRepository.create(newVotingEntity);

        const options: OptionEntity[] = dto.options.map(option => {
            const entity = new OptionEntity({
                text: option,
                votingId: newVoting.id // обогащаем каждый option votingId
            });
            return entity;
        });
        const newOptions = await this.optionRepository.createMany(options);

        return {
            voting: {
                ...newVoting,
                name: `${house.city}, ${house.street} ${house.houseNumber}`,
                options: newOptions
            }
        };
    }

    public async updateVoting(dto: EventUpdateVoting.Request): Promise<EventUpdateVoting.Response> {
        const voteEntity = new VoteEntity({
            userId: dto.userId,
            optionId: dto.optionId
        });
        const newVote = await this.voteRepository.create(voteEntity);

        return { vote: newVote };
    }

    async getVotings(userId: number, userRole: UserRole, meta: IMeta): Promise<{ votings: IGetVoting[], totalCount?: number }> {
        switch (userRole) {
            case UserRole.Owner:
                return await this.getVotingsForOwner(userId, meta);
            case UserRole.ManagementCompany:
                return await this.getVotingsForMC(userId, meta);
            default:
                throw new RMQException(INCORRECT_USER_ROLE.message, INCORRECT_USER_ROLE.status);
        }
    }

    private async getVotingsForOwner(userId: number, meta: IMeta): Promise<{ votings: IGetVoting[], totalCount?: number }> {
        const { houses } = await getHousesByOId(this.rmqService, userId);
        const mcIds = Array.from(new Set(houses.map(h => h.managementCompanyId)));
        const { profiles } = await checkUsers(this.rmqService, mcIds, UserRole.ManagementCompany);

        const { votings, totalCount } = await this.getVotingsGeneral(userId, houses, meta);

        return {
            votings: votings.map(voting => {
                const currentHouse = houses.find(house => house.id === voting.houseId);
                const currentMC = profiles.find(mc => mc.id === currentHouse.managementCompanyId);

                return {
                    name: currentMC.name,
                    ...voting
                };
            }),
            totalCount
        };
    }

    private async getVotingsForMC(userId: number, meta: IMeta): Promise<{ votings: IGetVoting[], totalCount?: number }> {
        const { houses } = await getHousesByMCId(this.rmqService, userId);
        const { votings, totalCount } = await this.getVotingsGeneral(userId, houses, meta);

        return {
            votings: votings.map((voting) => {
                const currentHouse = houses.find((house) => house.id === voting.houseId);
                let result: IGetOption | undefined;

                if (voting.status === VotingStatus.Close) {
                    result = voting.options.reduce((max, obj) =>
                        obj.numberOfVotes > max.numberOfVotes ? obj : max,
                        voting.options[0]
                    );
                } else result = undefined;

                return {
                    name: `${currentHouse.city}, ${currentHouse.street} ${currentHouse.houseNumber}`,
                    result: result ? result.text : undefined,
                    ...voting,
                };
            }),
            totalCount
        };
    }


    private async getVotingsGeneral(userId: number, houses: IHouse[], meta: IMeta) {
        if (!houses) {
            throw new RMQException(HOUSES_NOT_EXIST.message, HOUSES_NOT_EXIST.status);
        }
        const houseIds = houses.map(h => h.id);

        const { votings, totalCount } = await this.votingRepository.findVotingsByHouseIds(houseIds, meta);

        if (votings.length) {
            return {
                votings: votings.map(voting => {
                    const newOptions = voting.options.map((o) => {
                        return {
                            ...o,
                            numberOfVotes: o.votes.length,
                        };
                    });
                    return {
                        ...voting.get(),
                        options: newOptions
                    };
                }),
                totalCount
            };
        } else {
            return {
                votings: [],
                totalCount
            };
        }
    }
}