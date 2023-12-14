import { IMeta } from "@myhome/interfaces";
import { IsArray, IsInt, IsOptional, IsString } from "class-validator";
import { ValidateNestedObject } from "./object.validator";
import { ValidateNestedArray } from "./array.validator";

export class SearchValidator {
    @IsString({ message: "Поле поиска должно быть строкой" })
    searchField!: string;

    @IsString({ message: "Поисковой запрос должен быть строкой" })
    searchLine!: string;
}

export class FilterValidator {
    @IsString({ message: "Поле фильтрации должно быть строкой" })
    filterField!: string;

    @IsArray({ message: "Фильтры должны быть массивом" })
    filterArray!: string;
}

export class MetaValidator {
    @IsInt({ message: "Номер страницы должен быть числом" })
    page!: number;

    @IsInt({ message: "Максимальное количество результатов должно быть числом" })
    limit!: number;

    @IsOptional()
    @ValidateNestedObject(SearchValidator)
    search?: string;

    @IsOptional()
    @ValidateNestedArray(FilterValidator)
    filters?: string;
}

export class MetaRequest {
    @IsOptional()
    @ValidateNestedObject(MetaValidator)
    meta?: IMeta;
}

export class MetaResponse {
    totalCount!: number;
}