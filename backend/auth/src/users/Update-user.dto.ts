// import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
// import { Role } from '../decorators/roles.decorator';

// export class UpdateUserDto {
//   @IsOptional()
//   @IsEmail({}, { message: 'Please provide a valid email' })
//   email?: string;

//   @IsOptional()
//   @IsString()
//   @MinLength(8, { message: 'Password must be at least 8 characters' })
//   password?: string;

//   @IsOptional()
//   @IsEnum(Role, { message: `Role must be one of: ${Object.values(Role).join(', ')}` })
//   role?: Role;
// }
