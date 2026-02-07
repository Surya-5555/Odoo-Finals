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

export class ResetPasswordDto {
  @Transform(toOptionalString)
  @IsString()
  @IsNotEmpty()
  token: string;

  @Transform(toOptionalString)
  @IsString()
  @MinLength(9, { message: 'Password must be more than 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/, {
    message:
      'Password must contain uppercase, lowercase, special character, and be more than 8 characters',
  })
  newPassword: string;

  // Accept either confirmPassword or confirmNewPassword (frontend/Postman variance).
  // We require at least one, and whichever is provided must match newPassword.

  @AtLeastOneOf(['confirmPassword', 'confirmNewPassword'], {
    message: 'confirmPassword or confirmNewPassword is required',
  })
  private readonly _confirmOneOf?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  @ValidateIf((o: ResetPasswordDto) => o.confirmPassword !== undefined)
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  @ValidateIf((o: ResetPasswordDto) => o.confirmNewPassword !== undefined)
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmNewPassword?: string;
}
