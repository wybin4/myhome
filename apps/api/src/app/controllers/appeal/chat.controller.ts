import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AppealAddChat, AppealAddMessage, AppealGetChat, AppealGetChats, AppealGetMessage } from '@myhome/contracts';
import { GetChatsDto, AddChatDto, AddMessageDto } from '../../dtos/appeal/chat.dto';
import { SocketGateway } from '../../socket.gateway';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly rmqService: RMQService,
        private readonly socketGateway: SocketGateway
    ) { }

    @HttpCode(200)
    @Post('get-chats')
    async getChats(@Body() dto: GetChatsDto) {
        try {
            return await this.rmqService.send<
                AppealGetChats.Request,
                AppealGetChats.Response
            >(AppealGetChats.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-chat')
    async addChat(@Body() dto: AddChatDto) {
        try {
            return await this.rmqService.send<
                AppealAddChat.Request,
                AppealAddChat.Response
            >(AppealAddChat.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-message')
    async addMessage(@Body() dto: AddMessageDto) {
        try {
            return await this.rmqService.send<
                AppealAddMessage.Request,
                AppealAddMessage.Response
            >(AppealAddMessage.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @RMQValidate()
    @RMQRoute(AppealGetMessage.topic)
    async getMessage(@Body() dto: AppealGetMessage.Request) {
        this.socketGateway.sendMessageToClients(dto.message);
    }

    @RMQValidate()
    @RMQRoute(AppealGetChat.topic)
    async getChat(@Body() dto: AppealGetChat.Request) {
        this.socketGateway.sendChatToClients(dto.chat);
    }

}
