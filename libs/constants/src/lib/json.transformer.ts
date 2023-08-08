/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValueTransformer } from 'typeorm';

export class JsonTransformer implements ValueTransformer {
    to(value: Record<string, any>): string {
        return JSON.stringify(value);
    }

    from(value: string): Record<string, any> {
        return JSON.parse(value);
    }
}