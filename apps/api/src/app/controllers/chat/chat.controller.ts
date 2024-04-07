import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { CatchError } from '../../error.filter';
import { AddChatDto, AddMessageDto, GetReceiversDto, GetMessagesDto } from '../../dtos/chat/chat.dto';
import { SocketGateway } from '../../socket.gateway';
import { AddChat, AddMessage, GetReceivers, GetMessages } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { IJWTPayload } from '@myhome/interfaces';
import { JWTAuthGuard } from '../../guards/jwt.guard';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly rmqService: RMQService,
        private readonly socketGateway: SocketGateway
    ) { }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-receivers')
    async getReceivers(@Req() req: { user: IJWTPayload }, @Body() dto: GetReceiversDto) {
        try {
            return await this.rmqService.send<
                GetReceivers.Request,
                GetReceivers.Response
            >(GetReceivers.topic, { ...dto, ...req.user });
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(201)
    @Post('add-chat')
    async addChat(@Req() req: { user: IJWTPayload }, @Body() dto: AddChatDto) {
        try {
            const newDto = await this.rmqService.send<
                AddChat.Request,
                AddChat.Response
            >(AddChat.topic, { ...dto, ...req.user });
            this.socketGateway.sendNewChat(newDto);
            return newDto;
        } catch (e) {
            CatchError(e);
        }
    }

    // ДЛЯ ТЕСТОВ, УБРАТЬ
    // @UseGuards(JWTAuthGuard)
    @HttpCode(201)
    @Post('add-message')
    async addMessage(@Req() req: { user: IJWTPayload }, @Body() dto: AddMessageDto) {
        try {
            const { userId, userRole } = { ...dto, ...req.user }; // исправить

            const newDto = await this.rmqService.send<
                AddMessage.Request,
                AddMessage.Response
            >(AddMessage.topic, { ...dto, ...req.user });

            this.socketGateway.sendNewMessage(newDto);
            this.socketGateway.sendUpdateChat(
                newDto.chat, newDto.users,
                (user) => userId === user.userId
                    && userRole === user.userRole
            );
            return { ...newDto.createdMessage, chatId: newDto.chat.id };
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('get-messages')
    async getMessages(@Req() req: { user: IJWTPayload }, @Body() dto: GetMessagesDto) {
        try {
            const { userId, userRole } = { ...dto, ...req.user }; // исправить

            const newDto = await this.rmqService.send<
                GetMessages.Request,
                GetMessages.Response
            >(GetMessages.topic, { ...dto, ...req.user });
            this.socketGateway.sendUpdateChat(
                newDto.chat, newDto.users,
                (user) => userId !== user.userId
                    || userRole !== user.userRole
            );
            return { messages: newDto.messages };
        } catch (e) {
            CatchError(e);
        }
    }

}
