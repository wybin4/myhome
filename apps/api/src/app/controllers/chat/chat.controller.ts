import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddChat, AddMessage, ApiEmitChat, GetChats, ApiEmitMessage } from '@myhome/contracts';
import { GetChatsDto, AddChatDto, AddMessageDto } from '../../dtos/chat/chat.dto';
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
                GetChats.Request,
                GetChats.Response
            >(GetChats.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-chat')
    async addChat(@Body() dto: AddChatDto) {
        try {
            return await this.rmqService.send<
                AddChat.Request,
                AddChat.Response
            >(AddChat.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-message')
    async addMessage(@Body() dto: AddMessageDto) {
        try {
            return await this.rmqService.send<
                AddMessage.Request,
                AddMessage.Response
            >(AddMessage.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

    @RMQValidate()
    @RMQRoute(ApiEmitMessage.topic)
    async emitMessage(@Body() dto: ApiEmitMessage.Request) {
        this.socketGateway.sendMessageToClients(dto.message);
    }

    @RMQValidate()
    @RMQRoute(ApiEmitChat.topic)
    async emitChat(@Body() dto: ApiEmitChat.Request) {
        this.socketGateway.sendChatToClients(dto.chat);
    }

}
