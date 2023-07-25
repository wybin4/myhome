import { Injectable } from "@nestjs/common";
// import { IUser } from "@myhome/interfaces";
import { RMQService } from "nestjs-rmq";
// import { UserEntity } from "./entities/user.entity";
// import { UserRepository } from "./repositories/user.repository";

@Injectable()
export class UserService {
    constructor(
        // private readonly userRepository: UserRepository,
        private readonly rmqService: RMQService,
    ) { }

    // public async changeProfile(user: Pick<IUser, 'name'>, id: number) {
    //     const existedUser = await this.userRepository.findUserById(id);
    //     if (!existedUser) {
    //         throw new Error('Такого пользователя не существует');
    //     }
    //     const userEntity = new UserEntity(existedUser).updateProfile(user.name);
    //     await this.updateUser(await userEntity);
    //     return {};
    // }

    // private updateUser(user: UserEntity) {
    //     return Promise.all([
    //         this.userRepository.updateUser(user),
    //     ])
    // }
}