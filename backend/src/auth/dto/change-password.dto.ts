import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Match } from '../validators/match.decorator';
import { AtLeastOneOf } from '../validators/at-least-one-of.decorator';

const toOptionalString = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  return value;
};

export class ChangePasswordDto {
  @Transform(toOptionalString)
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @Transform(toOptionalString)
  @IsString()
  @MinLength(9, { message: 'Password must be more than 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/, {
    message:
      'Password must contain uppercase, lowercase, special character, and be more than 8 characters',
  })
  newPassword: string;

  @AtLeastOneOf(['confirmPassword', 'confirmNewPassword'], {
    message: 'confirmPassword or confirmNewPassword is required',
  })
  private readonly _confirmOneOf?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  @ValidateIf((o: ChangePasswordDto) => o.confirmPassword !== undefined)
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  @ValidateIf((o: ChangePasswordDto) => o.confirmNewPassword !== undefined)
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmNewPassword?: string;
}
