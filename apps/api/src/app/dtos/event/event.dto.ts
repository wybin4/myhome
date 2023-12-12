import { EventType } from "@myhome/interfaces";
import { GetMetaDto } from "../meta.dto";

export class GetEventsDto extends GetMetaDto {
    events!: EventType[];
}