import { IAddSubscriber } from "@myhome/interfaces";
import { GetMetaDto } from "../meta.dto";

export class AddSubscribersDto {
    subscribers: IAddSubscriber[];
}

export class UpdateSubscriberDto {
    id: number;
}

export class GetSubscribersByUserDto extends GetMetaDto {
}
