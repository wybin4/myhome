import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddChat, AddMessage, GetChat, GetChats, GetMessage } from '@myhome/contracts';
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
    @RMQRoute(GetMessage.topic)
    async getMessage(@Body() dto: GetMessage.Request) {
        this.socketGateway.sendMessageToClients(dto.message);
    }

    @RMQValidate()
    @RMQRoute(GetChat.topic)
    async getChat(@Body() dto: GetChat.Request) {
        this.socketGateway.sendChatToClients(dto.chat);
    }

}
