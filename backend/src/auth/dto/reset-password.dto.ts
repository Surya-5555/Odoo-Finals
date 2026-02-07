import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { Match } from '../validators/match.decorator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(9, { message: 'Password must be more than 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/,
    {
      message:
        'Password must contain uppercase, lowercase, special character, and be more than 8 characters',
    },
  )
  newPassword: string;

  @IsString()
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword: string;
}
