import { IMessage, SenderType } from '@myhome/interfaces';
import { IsNumber, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace AppealAddMessage {
    export const topic = 'appeal.add-message.command';

    export class Request {
        @IsString()
        chatId!: string;

        @IsString()
        @MaxLength(1000)
        text!: string;

        @IsNumber()
        senderId!: number;

        @Validate(IsValidEnumValue, [SenderType])
        senderRole!: SenderType;
    }

    export class Response {
        message!: IMessage;
    }
}

