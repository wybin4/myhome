/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppealType, IGetAppeal } from '@myhome/interfaces';
import { IsOptional, Validate, ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';
import { ParseInt } from '../../parse.validator';

export namespace EventAddAppeal {
    export const topic = 'event.add-appeal.command';

    export class Request {
        @ParseInt({ message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @ParseInt({ message: "Id абонента должен быть числом" })
        subscriberId!: number;

        @Validate(IsValidEnumValue, [AppealType])
        typeOfAppeal!: AppealType;

        @IsDataValidBasedOnTypeOfAppeal()
        @IsOptional()
        typeOfServiceId?: number;

        @IsOptional()
        apartmentId?: number;

        @IsOptional()
        factoryNumber?: string;

        @IsOptional()
        issuedAt?: Date;

        @IsOptional()
        verifiedAt?: Date;

        @IsOptional()
        meterId?: number;

        @IsOptional()
        text?: string;

        @IsOptional()
        attachment?: string;
    }

    export class Response {
        appeal!: IGetAppeal;
    }
}

function isStringNumeric(value: string): boolean {
    return !isNaN(parseFloat(value));
}

export function IsDataValidBasedOnTypeOfAppeal(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isDataValidBasedOnTypeOfAppeal',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const typeOfAppeal = (args.object as any).typeOfAppeal;
                    const data = args.object as any

                    switch (typeOfAppeal) {
                        case AppealType.AddIndividualMeter:
                            return isStringNumeric(data.typeOfServiceId)
                                && isStringNumeric(data.apartmentId)
                                && typeof data.factoryNumber === 'string'
                                && new Date(data.verifiedAt) instanceof Date
                                && new Date(data.issuedAt) instanceof Date
                                && data.attachment !== undefined;
                        case AppealType.VerifyIndividualMeter:
                            return isStringNumeric(data.meterId)
                                && new Date(data.verifiedAt) instanceof Date
                                && new Date(data.issuedAt) instanceof Date
                                && data.attachment !== undefined;
                        case AppealType.ProblemOrQuestion:
                            return typeof data.text === 'string' && data.text.length <= 1000;
                        case AppealType.Claim:
                            return typeof data.text === 'string' && data.text.length <= 1000;
                    }

                    return false;
                },

                defaultMessage(args: ValidationArguments) {
                    const typeOfAppeal = (args.object as any).typeOfAppeal;
                    const data = args.object as any
                    const errors: string[] = [];

                    switch (typeOfAppeal) {
                        case AppealType.AddIndividualMeter:
                            if (isStringNumeric(data.typeOfServiceId)) {
                                errors.push("Id вида услуг должен быть числом");
                            }
                            if (isStringNumeric(data.apartmentId)) {
                                errors.push("Id квартиры должен быть числом");
                            }
                            if (typeof data.factoryNumber !== 'string') {
                                errors.push("Заводской номер должен быть строкой");
                            }
                            if (!(new Date(data.verifiedAt) instanceof Date)) {
                                errors.push("Дата поверки должна быть датой");
                            }
                            if (!(new Date(data.issuedAt) instanceof Date)) {
                                errors.push("Дата окончания поверки должна быть датой");
                            }
                            if (data.attachment === undefined) {
                                errors.push("Вложение отсутствует");
                            }
                            return "Неверные данные для обращения по поводу добавления счётчика: ".concat(errors.join("; "));
                        case AppealType.VerifyIndividualMeter:
                            if (isStringNumeric(data.meterId)) {
                                errors.push("Id счётчика должен быть числом");
                            }
                            if (!(new Date(data.verifiedAt) instanceof Date)) {
                                errors.push("Дата поверки должна быть датой");
                            }
                            if (data.attachment === undefined) {
                                errors.push("Вложение отсутствует");
                            }
                            return "Неверные данные для обращения по поводу поверки счётчика: ".concat(errors.join("; "));
                        case AppealType.ProblemOrQuestion:
                            if (typeof data.text !== 'string') {
                                errors.push("Текст обращения должен быть строкой");
                            }
                            if (data.text.length > 1000) {
                                errors.push("Текст обращения не должен превышать 1000 символов");
                            }
                            return "Неверные данные для обращения по проблемы или вопроса: ".concat(errors.join("; "));
                        case AppealType.Claim:
                            if (typeof data.text !== 'string') {
                                errors.push("Текст обращения должен быть строкой");
                            }
                            if (data.text.length > 1000) {
                                errors.push("Текст обращения не должен превышать 1000 символов");
                            }
                            return "Неверные данные для обращения: ".concat(errors.join("; "));
                    }
                    return "Неверные данные для обращения";
                }
            },
        });
    };
}
