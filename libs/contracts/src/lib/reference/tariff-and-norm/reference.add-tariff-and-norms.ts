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
    return typeof data.unitId === 'number' && typeof data.managementCompanyId === 'number';
}

function getUnitAndMCMessage(data: any, errors: string[]) {
    if (typeof data.unitId !== 'number') {
        errors.push("Id единиц измерения должен быть числом");
    }
    if (typeof data.managementCompanyId !== 'number') {
        errors.push("Id управляющей компании должен быть числом");
    }
}

function getNormMessage(data: any, errors: string[]) {
    if (typeof data.norm !== 'number') {
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
                                return typeof data.norm === 'number'
                                    && typeof data.amount === 'number'
                                    && checkUnitAndMC(data);
                            case TariffAndNormType.MunicipalTariff:
                                return typeof data.norm === 'number'
                                    && (!data.supernorm || typeof data.supernorm === 'number')
                                    && (!data.multiplyingFactor || typeof data.multiplyingFactor === 'number')
                                    && checkUnitAndMC(data);
                            case TariffAndNormType.Norm:
                                return typeof data.norm === 'number'
                                    && checkEnum(TypeOfNorm, data.typeOfNorm)
                                    && checkUnitAndMC(data);
                            case TariffAndNormType.SeasonalityFactor:
                                return typeof data.coefficient === 'number'
                                    && typeof data.managementCompanyId === 'number'
                                    && typeof data.monthName === 'string'
                                    && data.monthName.length <= 10;
                            case TariffAndNormType.CommonHouseNeedTariff:
                                return typeof data.multiplier === 'number'
                                    && typeof data.houseId === 'number'
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
                                if (typeof data.amount !== 'number') {
                                    errors.push("Количество должно быть числом");
                                }
                                getUnitAndMCMessage(data, errors);
                                return "Неверные данные о социальной норме: ".concat(errors.join("; "));
                            case TariffAndNormType.MunicipalTariff:
                                getNormMessage(data, errors);
                                if (!data.supernorm || typeof data.supernorm === 'number') {
                                    errors.push("Тариф сверх нормы должен быть числом");
                                }
                                if (!data.multiplyingFactor || typeof data.multiplyingFactor === 'number') {
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
                                if (typeof data.coefficient !== 'number') {
                                    errors.push("Коэффициент должен быть числом");
                                }
                                if (typeof data.managementCompanyId !== 'number') {
                                    errors.push("Id управляющей компании должен быть числом");
                                }
                                if (typeof data.monthName !== 'string' && data.monthName.length <= 10) {
                                    errors.push("Неверное название месяца");
                                }
                                return "Неверные данные о коэффициенте сезонности: ".concat(errors.join("; "));
                            case TariffAndNormType.CommonHouseNeedTariff:
                                if (typeof data.multiplier !== 'number') {
                                    errors.push("Множитель должен быть числом");
                                }
                                if (typeof data.houseId !== 'number') {
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

