import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ChatEntity } from './chat.entity';
import { Chat } from './chat.model';
import { IChatUser } from '@myhome/interfaces';

@Injectable()
export class ChatRepository {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<Chat>
    ) { }

    async create(chat: ChatEntity) {
        const newChat = new this.chatModel(chat);
        return await newChat.save();
    }

    async findById(_id: string) {
        return await this.chatModel.findById(_id).exec();
    }

    async findManyByUser(user: IChatUser): Promise<Chat[]> {
        return await this.chatModel.find({ 'users.userId': user.userId, 'users.userRole': user.userRole }).exec();
    }

}
