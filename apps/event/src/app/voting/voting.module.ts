import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VotingController } from "./voting.controller";
import { VotingEntity } from "./entities/voting.entity";
import { VotingRepository } from "./repositories/voting.repository";
import { VotingService } from "./voting.service";
import { OptionRepository } from "./repositories/option.repository";
import { OptionEntity } from "./entities/option.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([VotingEntity, OptionEntity]),
    ],
    providers: [VotingRepository, OptionRepository, VotingService],
    exports: [VotingRepository, OptionRepository],
    controllers: [VotingController],
})
export class VotingModule { }