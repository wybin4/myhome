/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";

export interface ISinglePaymentDocument {
    id?: number;
    managementCompanyId: number;
    subscriberId: number;
    amount?: number;
    debt?: number;
    penalty?: number;
    deposit?: number;
    createdAt: Date;
    status: CalculationState;
}

export enum CalculationState {
    Started = 'Started',
    DetailsCalculated = 'DetailsCalculated',
    CorrectionsCalculated = 'CorrectionsCalculated',
    Cancelled = 'Cancelled',
}

export function RequireSubscriberIdsOrHouseIds(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'RequireSubscriberIdsOrHouseIds',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const subscriberIds = (args.object as any).subscriberIds;
                    const houseIds = (args.object as any).houseIds;
                    return !!houseIds || !!subscriberIds || value === undefined; // Allow missing field
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                defaultMessage(args: ValidationArguments) {
                    return `Введите houseIds или subscriberIds`;
                },
            },
        });
    };
}
