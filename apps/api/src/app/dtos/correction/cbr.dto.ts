import { IsDate, IsOptional } from "class-validator";

export class GetKeyRateDto {
    @IsOptional()
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @IsDate()
    endDate?: Date;
}
