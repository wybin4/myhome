import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VotingController } from "./voting.controller";
import { VotingEntity } from "./entities/voting.entity";
import { VotingRepository } from "./repositories/voting.repository";
import { VotingService } from "./voting.service";
import { OptionRepository } from "./repositories/option.repository";
import { OptionEntity } from "./entities/option.entity";
import { VoteRepository } from "./repositories/vote.repository";
import { VoteEntity } from "./entities/vote.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([VotingEntity, OptionEntity, VoteEntity]),
    ],
    providers: [
        VotingRepository, OptionRepository, VoteRepository,
        VotingService
    ],
    controllers: [VotingController],
    exports: [VotingService],
})
export class VotingModule { }