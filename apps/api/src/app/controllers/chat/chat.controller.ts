import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { CatchError } from '../../error.filter';
import { AddChatDto, AddMessageDto, ReadMessagesDto, GetReceiversDto } from '../../dtos/chat/chat.dto';
import { SocketGateway } from '../../socket.gateway';
import { AddChat, AddMessage, ReadMessages, GetReceivers } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload } from '@myhome/interfaces';

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
    async addChat(@Body() dto: AddChatDto) {
        try {
            const newDto = await this.rmqService.send<
                AddChat.Request,
                AddChat.Response
            >(AddChat.topic, dto);
            this.socketGateway.sendChatToClients(newDto);
            return newDto;
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(201)
    @Post('add-message')
    async addMessage(@Req() req: { user: IJWTPayload }, @Body() dto: AddMessageDto) {
        try {
            const { userId: senderId, userRole: senderRole } = req.user;
            const newDto = await this.rmqService.send<
                AddMessage.Request,
                AddMessage.Response
            >(AddMessage.topic, { ...dto, senderId, senderRole });
            this.socketGateway.sendMessageToClients(newDto);
        } catch (e) {
            CatchError(e);
        }
    }

    @UseGuards(JWTAuthGuard)
    @HttpCode(200)
    @Post('read-messages')
    async readMessages(@Req() req: { user: IJWTPayload }, @Body() dto: ReadMessagesDto) {
        try {
            const newDto = await this.rmqService.send<
                ReadMessages.Request,
                ReadMessages.Response
            >(ReadMessages.topic, { ...dto, ...req.user });
            this.socketGateway.sendMessagesToClients(newDto);
        } catch (e) {
            CatchError(e);
        }
    }

}
