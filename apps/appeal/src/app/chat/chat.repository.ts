import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ChatEntity } from './chat.entity';
import { Chat } from './chat.model';

@Injectable()
export class ChatRepository {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<Chat>
    ) { }

    async create(chat: ChatEntity) {
        const newChat = new this.chatModel(chat);
        return newChat.save();
    }

    async findById(_id: string) {
        return this.chatModel.findById(_id).exec();
    }

    async findManyByAppealIds(appealIds: number[]): Promise<Chat[]> {
        return this.chatModel.find({ appealId: { $in: appealIds } }).exec();
    }

}
