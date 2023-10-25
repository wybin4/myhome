import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AppealAddChat, AppealAddMessage, AppealGetChats } from '@myhome/contracts';
import { GetChatsDto, AddChatDto, AddMessageDto } from '../../dtos/appeal/chat.dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly rmqService: RMQService) { }

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

}
