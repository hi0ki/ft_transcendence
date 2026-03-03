import { IsNotEmpty, IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(20)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/,
    {
      message:
        'Password must contain uppercase, lowercase, and special character',
    },
  )
  @IsNotEmpty({ message: 'password is required' })
  password: string;


  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(10, { message: 'Username must not exceed 10 characters' })
  @IsNotEmpty({ message: 'username is required' })
  username: string;
}