/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationOptions, registerDecorator, ValidationArguments } from "class-validator";

export interface IVoting {
    id?: number;
    managementCompanyId: number;
    title: string;
    createdAt: Date;
    expiredAt: Date;
}

export interface IOption {
    id?: number;
    votingId: number;
    text: string;
    numberOfVotes?: number;
}

export interface IVotingWithOptions {
    voting: IVoting; options: IOption[];
}

export function RequireSubscriberOrManagementCompany(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'RequireSubscriberOrManagementCompany',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const subscriberId = (args.object as any).subscriberId;
                    const managementCompanyId = (args.object as any).managementCompanyId;
                    return !!subscriberId || !!managementCompanyId;
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                defaultMessage(args: ValidationArguments) {
                    return `Введите subscriberId или managementCompanyId`;
                },
            },
        });
    };
}
