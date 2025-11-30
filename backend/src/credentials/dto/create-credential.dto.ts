import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmptyObject, IsObject, IsOptional, IsString, registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export class CreateCredentialDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Type array must contain at least one type' })
  @ArrayMaxSize(10, { message: 'Type array cannot exceed 10 types' })
  @IsString({ each: true })
  type: string[];

  @IsObject()
  @IsNotEmptyObject({}, { message: 'Credential subject cannot be empty' })
  @MaxJSONSize(50000, {
    message: 'Credential subject is too large (max 50KB)',
  })
  credentialSubject: Record<string, any>;

  @IsString()
  @IsOptional()
  @IsValidDID()
  issuer?: string;
  
  @IsString()
  userId: string;
}

function MaxJSONSize(maxSize: number, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxJSONSize',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [maxSize],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [maxSize] = args.constraints;
          const jsonString = JSON.stringify(value);
          return jsonString.length <= maxSize;
        },
        defaultMessage(args: ValidationArguments) {
          const [maxSize] = args.constraints;
          return `${args.property} JSON size must not exceed ${maxSize} bytes`;
        },
      },
    });
  };
}
function IsValidDID(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidDID',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const didRegex = /^did:[a-z0-9]+:[a-zA-Z0-9._:%-]+$/;
          return didRegex.test(value);
        },
        defaultMessage() {
          return 'Invalid DID format. Must follow pattern: did:method:identifier (e.g., did:example:user123)';
        },
      },
    });
  };
}

