/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppealData, AppealType, IAppealData } from '@myhome/interfaces';
import { IsNumber, Validate, ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';

export namespace EventAddAppeal {
    export const topic = 'event.add-appeal.command';

    export class Request {
        @IsNumber({}, { message: "Id управляющей компании должен быть числом" })
        managementCompanyId!: number;

        @IsNumber({}, { message: "Id абонента должен быть числом" })
        subscriberId!: number;

        @Validate(IsValidEnumValue, [AppealType])
        typeOfAppeal!: AppealType;

        @IsDataValidBasedOnTypeOfAppeal()
        data!: AppealData;
    }

    export class Response {
        appeal!: IAppealData;
    }
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
                    const data = (args.object as any).data;

                    if (data !== undefined) {
                        switch (typeOfAppeal) {
                            case AppealType.AddIndividualMeter:
                                return typeof data.typeOfServiceId === 'number'
                                    && typeof data.apartmentId === 'number'
                                    && typeof data.factoryNumber === 'string'
                                    && new Date(data.verifiedAt) instanceof Date
                                    && new Date(data.issuedAt) instanceof Date
                            case AppealType.VerifyIndividualMeter:
                                return typeof data.meterId === 'number'
                                    && new Date(data.verifiedAt) instanceof Date
                                    && data.attachment !== undefined;
                            case AppealType.ProblemOrQuestion:
                                return typeof data.text === 'string' && data.text.length <= 1000;
                            case AppealType.Claim:
                                return typeof data.text === 'string' && data.text.length <= 1000;
                        }
                    }

                    return false;
                },

                defaultMessage(args: ValidationArguments) {
                    const typeOfAppeal = (args.object as any).typeOfAppeal;
                    const data = (args.object as any).data;
                    const errors: string[] = [];

                    if (data !== undefined) {
                        switch (typeOfAppeal) {
                            case AppealType.AddIndividualMeter:
                                if (typeof data.typeOfServiceId !== 'number') {
                                    errors.push("Id вида услуг должен быть числом");
                                }
                                if (typeof data.apartmentId !== 'number') {
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
                                return "Неверные данные для обращения по поводу добавления счётчика: ".concat(errors.join("; "));
                            case AppealType.VerifyIndividualMeter:
                                if (typeof data.meterId !== 'number') {
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
                    }
                    return "Неверные данные для обращения";
                }
            },
        });
    };
}
