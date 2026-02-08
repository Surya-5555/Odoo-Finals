import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Match } from '../validators/match.decorator';
import { AtLeastOneOf } from '../validators/at-least-one-of.decorator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

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
  @IsString()
  @ValidateIf((o) => o.confirmPassword !== undefined)
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.confirmNewPassword !== undefined)
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmNewPassword?: string;
}
