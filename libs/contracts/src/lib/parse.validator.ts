/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationOptions, registerDecorator } from "class-validator";

export function ParseInt(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'ParseInt',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const valueAsNumber = Number(value);
                    return !isNaN(valueAsNumber) || typeof value === 'number';
                },

                defaultMessage() {
                    return `Значение должно быть числом`;
                }
            },
        });
    };
}

export function ParseDate(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'ParseDate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const valueAsDate = new Date(value);
                    return !isNaN(valueAsDate.getTime());
                },

                defaultMessage() {
                    return `Значение должно быть датой`;
                }
            },
        });
    };
}