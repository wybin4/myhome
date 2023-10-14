import { USER_NOT_EXIST } from "../../errors/user.errors";
import { RMQException } from "../../exception";
import { RMQService } from 'nestjs-rmq';
import { AccountUserInfo } from '@myhome/contracts';
import { UserRole } from "@myhome/interfaces";

export async function checkUser(rmqService: RMQService, id: number, userRole: UserRole) {
    try {
        return await rmqService.send<AccountUserInfo.Request, AccountUserInfo.Response>
            (AccountUserInfo.topic, { id: id, role: userRole });
    } catch (e) {
        throw new RMQException(USER_NOT_EXIST.message(id), USER_NOT_EXIST.status);
    }
}