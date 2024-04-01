import { EventTypeRequest } from "@myhome/interfaces";
import { GetMetaDto } from "../meta.dto";

export class GetEventsDto extends GetMetaDto {
    eventType!: EventTypeRequest;
}