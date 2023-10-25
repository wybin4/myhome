import { ChatRepository } from "./chat.repository";
import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { Chat, ChatSchema } from "./chat.model";
import { MongooseModule } from "@nestjs/mongoose";
import { AppealModule } from "../appeal/appeal.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
        ]),
        AppealModule
    ],
    providers: [
        ChatRepository,
        ChatService,
    ],
    exports: [
        ChatRepository
    ],
    controllers: [ChatController],
})
export class ChatModule { }