import { IMeta } from "@myhome/interfaces";
import { IsArray, IsInt, IsOptional, IsString } from "class-validator";
import { ValidateNestedObject } from "./object.validator";

export class MetaValidator {
    @IsInt({ message: "Номер страницы должен быть числом" })
    page!: number;

    @IsInt({ message: "Максимальное количество результатов должно быть числом" })
    limit!: number;

    @IsOptional()
    @IsString({ message: "Поле поиска должно быть строкой" })
    searchField?: string;

    @IsOptional()
    @IsString({ message: "Поисковой запрос должен быть строкой" })
    searchLine?: string;

    @IsOptional()
    @IsString({ message: "Поле фильтрации должно быть строкой" })
    filterField?: string;

    @IsOptional()
    @IsArray({ message: "Фильтры должны быть массивом" })
    filterArray?: string;
}

export class MetaRequest {
    @IsOptional()
    @ValidateNestedObject(MetaValidator)
    meta?: IMeta;
}

export class MetaResponse {
    totalCount!: number;
}