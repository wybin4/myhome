import { ValueTransformer } from 'typeorm';

type EnumType<T> = { [K in keyof T]: T[K] };

export function GenericEnumTransformer<T>(enumType: EnumType<T>): ValueTransformer {
  return {
    from: (value: string) => enumType[value as keyof EnumType<T>],
    to: (value: T) => value,
  };
}
