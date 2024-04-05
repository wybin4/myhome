import { ChatRepository } from "./chat.repository";
import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { Chat, ChatSchema, Message, MessageSchema } from "./chat.model";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
            { name: Message.name, schema: MessageSchema },
        ]),
    ],
    providers: [
        ChatRepository,
        ChatService
    ],
    exports: [
        ChatRepository
    ],
    controllers: [ChatController],
})
export class ChatModule { }