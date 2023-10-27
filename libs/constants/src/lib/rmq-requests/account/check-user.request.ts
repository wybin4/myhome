import { USERS_NOT_EXIST, USER_NOT_EXIST } from "../../errors/user.errors";
import { RMQException } from "../../exception";
import { RMQService } from 'nestjs-rmq';
import { AccountUserInfo, AccountUsersInfo } from '@myhome/contracts';
import { UserRole } from "@myhome/interfaces";

export async function checkUser(rmqService: RMQService, id: number, userRole: UserRole) {
    try {
        return await rmqService.send<AccountUserInfo.Request, AccountUserInfo.Response>
            (AccountUserInfo.topic, { id: id, role: userRole });
    } catch (e) {
        throw new RMQException(USER_NOT_EXIST.message(id), USER_NOT_EXIST.status);
    }
}

export async function checkUsers(rmqService: RMQService, ids: number[], userRole: UserRole) {
    try {
        return await rmqService.send<AccountUsersInfo.Request, AccountUsersInfo.Response>
            (AccountUsersInfo.topic, { ids: ids, role: userRole });
    } catch (e) {
        throw new RMQException(USERS_NOT_EXIST.message, USERS_NOT_EXIST.status);
    }
}