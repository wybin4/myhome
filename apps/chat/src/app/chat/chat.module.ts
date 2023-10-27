import { ChatRepository } from "./chat.repository";
import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { Chat, ChatSchema } from "./chat.model";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatEventEmitter } from "./chat.event-emitter";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
        ]),
    ],
    providers: [
        ChatRepository,
        ChatService,
        ChatEventEmitter
    ],
    exports: [
        ChatRepository
    ],
    controllers: [ChatController],
})
export class ChatModule { }