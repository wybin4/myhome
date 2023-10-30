import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CatchError } from '../../error.filter';
import { GetChatsDto, AddChatDto, AddMessageDto, ReadMessagesDto } from '../../dtos/chat/chat.dto';
import { SocketGateway } from '../../socket.gateway';
import { GetChats, AddChat, AddMessage, ReadMessages } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';

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
            const newDto = await this.rmqService.send<
                AddChat.Request,
                AddChat.Response
            >(AddChat.topic, dto);
            this.socketGateway.sendChatToClients(newDto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(201)
    @Post('add-message')
    async addMessage(@Body() dto: AddMessageDto) {
        try {
            const newDto = await this.rmqService.send<
                AddMessage.Request,
                AddMessage.Response
            >(AddMessage.topic, dto);
            this.socketGateway.sendMessageToClients(newDto);
        } catch (e) {
            CatchError(e);
        }
    }

    @HttpCode(200)
    @Post('read-messages')
    async readMessages(@Body() dto: ReadMessagesDto) {
        try {
            const newDto = await this.rmqService.send<
                ReadMessages.Request,
                ReadMessages.Response
            >(ReadMessages.topic, dto);
            this.socketGateway.sendMessagesToClients(newDto);
        } catch (e) {
            CatchError(e);
        }
    }

}
