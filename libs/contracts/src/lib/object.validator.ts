/* eslint-disable @typescript-eslint/no-explicit-any */
import { plainToInstance } from "class-transformer";
import { ValidationOptions, registerDecorator, validate } from "class-validator";

export function ValidateNestedObject(className: any, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "ValidateNestedObject",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            async: true,
            validator: {
                async validate(value: any): Promise<boolean> {
                    const items = value;
                    const errors: string[] = [];

                    async function validateItem(items: any): Promise<boolean> {
                        const object = plainToInstance(className, items);
                        const objErrors = await validate(object);
                        if (objErrors.length > 0) {
                            errors.push(objErrors.map((oe) => {
                                const constraintValues = Object.values(oe.constraints || "");
                                return constraintValues.join('; ');
                            }).join("; "))
                        }

                        return !objErrors.length;
                    }

                    const validations = await validateItem(items);

                    if (errors.length > 0) {
                        throw new Error(errors.join("; "));
                    }

                    return validations;
                }
            }
        });
    }
}
