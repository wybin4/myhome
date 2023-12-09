/* eslint-disable @typescript-eslint/no-explicit-any */
import { plainToInstance } from "class-transformer";
import { ValidationOptions, registerDecorator, validate } from "class-validator";

export function ValidateNestedArray(className: any, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "ValidateNestedArray",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            async: true,
            validator: {
                async validate(value: any): Promise<boolean> {
                    const items = value;
                    const errors: Set<string> = new Set();

                    async function validateItem(item: any): Promise<boolean> {
                        const object = plainToInstance(className, item);
                        const objErrors = await validate(object);
                        if (objErrors.length > 0) {
                            errors.add(objErrors.map((oe) => {
                                const constraintValues = Object.values(oe.constraints || "");
                                return constraintValues.join('; ');
                            }).join("; "))
                        }

                        return !objErrors.length;
                    }

                    const validations = await Promise.all(items.map(validateItem));
                    const uniqueErrors = Array.from(errors);

                    if (uniqueErrors.length > 0) {
                        throw new Error(uniqueErrors.join("; "))
                    }

                    return validations.filter(isValidated => !isValidated).length === 0;
                }
            }
        });
    }
}
