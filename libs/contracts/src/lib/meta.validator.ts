import { IsInt, IsOptional, IsString } from "class-validator";

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
}