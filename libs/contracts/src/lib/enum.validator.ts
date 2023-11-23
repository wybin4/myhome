/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isValidEnumValue', async: false })
export class IsValidEnumValue implements ValidatorConstraintInterface {
    validate(value: any, validationArguments: ValidationArguments) {
        const enumType = validationArguments.constraints[0];
        const enumValues = Object.values(enumType);
        return enumValues.includes(value);
    }

    defaultMessage(validationArguments: ValidationArguments) {
        const enumType = validationArguments.constraints[0];
        return `Неверное значение перечисления. Выберите одно из значений: ${Object.values(enumType).join(', ')}.`;
    }
}

@ValidatorConstraint({ name: 'isValidEnumArray', async: false })
export class IsValidEnumArray implements ValidatorConstraintInterface {
    validate(values: any[], validationArguments: ValidationArguments) {
        const enumType = validationArguments.constraints[0];
        if (!enumType) {
            return false;
        }

        const enumValues = Object.values(enumType);
        if (!values || !values.length || !Array.isArray(values)) {
            return false;
        }
        const hasInvalidValue = values.some(value => !enumValues.includes(value));

        return !hasInvalidValue;
    }

    defaultMessage(validationArguments: ValidationArguments) {
        const enumType = validationArguments.constraints[0];
        return `Неверное значение в массиве перечислений. Выберите одно из значений: ${Object.values(enumType).join(', ')}.`;
    }
}
