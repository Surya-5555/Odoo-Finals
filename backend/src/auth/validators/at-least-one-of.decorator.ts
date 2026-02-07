import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function AtLeastOneOf(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'AtLeastOneOf',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [properties],
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const [props] = args.constraints as [string[]];
          const obj = args.object as Record<string, unknown>;
          return props.some((p) => {
            const v = obj[p];
            return typeof v === 'string' ? v.trim().length > 0 : v != null;
          });
        },
      },
    });
  };
}
