/* eslint-disable @typescript-eslint/no-explicit-any */
import { TariffAndNormType, TariffAndNormData, TariffOrNormType, TypeOfNorm } from '@myhome/interfaces';
import { ArrayMinSize, IsDefined, Validate, ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { IsValidEnumValue } from '../../enum.validator';
import { ValidateNestedArray } from '../../array.validator';
import { ParseInt } from '../../parse.validator';

export namespace ReferenceAddTariffsOrNorms {
    export const topic = 'reference.add-tariffs-and-norms.command';

    class TariffOrNormValidator {
        @ParseInt({ message: "Id вида услуг должен быть числом" })
        typeOfServiceId!: number;

        @IsDataValidBasedOnTypeOfTNType()
        data!: TariffAndNormData;

        @Validate(IsValidEnumValue, [TariffAndNormType])
        type!: TariffAndNormType;
    }

    export class Request {
        @IsDefined({ message: "Массив тарифов или норм должен существовать" })
        @ArrayMinSize(1, { message: "Массив тарифов или норм не должен быть пустым" })
        @ValidateNestedArray(TariffOrNormValidator)
        tariffAndNorms!: IAddTariffAndNorm[];
    }

    export class Response {
        tariffAndNorms!: Array<TariffOrNormType & { typeOfServiceName: string; unitName?: string; houseName?: string }>;
    }
}

export interface IAddTariffAndNorm {
    typeOfServiceId: number;
    data: TariffAndNormData;
    type: TariffAndNormType;
}

function checkUnitAndMC(data: any) {
    return parseInt(data.unitId) && parseInt(data.managementCompanyId);
}

function getUnitAndMCMessage(data: any, errors: string[]) {
    if (parseInt(data.unitId)) {
        errors.push("Id единиц измерения должен быть числом");
    }
    if (parseInt(data.managementCompanyId)) {
        errors.push("Id управляющей компании должен быть числом");
    }
}

function getNormMessage(data: any, errors: string[]) {
    if (parseInt(data.norm)) {
        errors.push("Норматив должен быть числом");
    }
}

function getEnumMessage(enumType: any, value: any, errors: string[]) {
    if (checkEnum(enumType, value)) {
        errors.push(`Неверное значение перечисления. Выберите одно из значений: ${Object.values(enumType).join(', ')}.`);
    }
}

function checkEnum(enumType: any, value: any) {
    const enumValues = Object.values(enumType);
    return enumValues.includes(value);
}

function parseInt(int: number) {
    return !isNaN(Number(int)) || typeof int === 'number';
}

export function IsDataValidBasedOnTypeOfTNType(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsDataValidBasedOnTypeOfTNType',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const type = (args.object as any).type;
                    const data = (args.object as any).data;

                    if (data !== undefined) {
                        switch (type) {
                            case TariffAndNormType.SocialNorm:
                                return parseInt(data.norm)
                                    && parseInt(data.amount)
                                    && checkUnitAndMC(data);
                            case TariffAndNormType.MunicipalTariff:
                                return parseInt(data.norm)
                                    && (!data.supernorm || parseInt(data.supernorm))
                                    && (!data.multiplyingFactor || parseInt(data.multiplyingFactor))
                                    && checkUnitAndMC(data);
                            case TariffAndNormType.Norm:
                                return parseInt(data.norm)
                                    && checkEnum(TypeOfNorm, data.typeOfNorm)
                                    && checkUnitAndMC(data);
                            case TariffAndNormType.SeasonalityFactor:
                                return typeof parseInt(data.coefficient)
                                    && typeof parseInt(data.managementCompanyId)
                                    && typeof data.monthName === 'string'
                                    && data.monthName.length <= 10;
                            case TariffAndNormType.CommonHouseNeedTariff:
                                return parseInt(data.multiplier)
                                    && parseInt(data.houseId)
                                    && checkUnitAndMC(data);
                        }
                    }

                    return false;
                },

                defaultMessage(args: ValidationArguments) {
                    const type = (args.object as any).type;
                    const data = (args.object as any).data;
                    const errors: string[] = [];

                    if (data !== undefined) {
                        switch (type) {
                            case TariffAndNormType.SocialNorm:
                                getNormMessage(data, errors);
                                if (parseInt(data.amount)) {
                                    errors.push("Количество должно быть числом");
                                }
                                getUnitAndMCMessage(data, errors);
                                return "Неверные данные о социальной норме: ".concat(errors.join("; "));
                            case TariffAndNormType.MunicipalTariff:
                                getNormMessage(data, errors);
                                if (!data.supernorm || parseInt(data.supernorm)) {
                                    errors.push("Тариф сверх нормы должен быть числом");
                                }
                                if (!data.multiplyingFactor || parseInt(data.multiplyingFactor)) {
                                    errors.push("Повышающий коэффициент должен быть числом");
                                }
                                getUnitAndMCMessage(data, errors);
                                return "Неверные данные о муниципальном тарифе: ".concat(errors.join("; "));
                            case TariffAndNormType.Norm:
                                getNormMessage(data, errors);
                                getEnumMessage(TypeOfNorm, data.typeOfNorm, errors);
                                getUnitAndMCMessage(data, errors);
                                return "Неверные данные о нормативе: ".concat(errors.join("; "));
                            case TariffAndNormType.SeasonalityFactor:
                                if (parseInt(data.coefficient)) {
                                    errors.push("Коэффициент должен быть числом");
                                }
                                if (parseInt(data.managementCompanyId)) {
                                    errors.push("Id управляющей компании должен быть числом");
                                }
                                if (typeof data.monthName !== 'string' && data.monthName.length <= 10) {
                                    errors.push("Неверное название месяца");
                                }
                                return "Неверные данные о коэффициенте сезонности: ".concat(errors.join("; "));
                            case TariffAndNormType.CommonHouseNeedTariff:
                                if (parseInt(data.multiplier)) {
                                    errors.push("Множитель должен быть числом");
                                }
                                if (parseInt(data.houseId)) {
                                    errors.push("Id дома должен быть числом");
                                }
                                getUnitAndMCMessage(data, errors);
                                return "Неверные данные о тарифе на общедомовые нужды: ".concat(errors.join("; "));

                        }
                    }
                    return "Неверные данные о тарифе или норме";
                }
            },
        });
    };
}

