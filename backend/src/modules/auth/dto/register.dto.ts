import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'juan@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])/, {
    message: 'Password too weak. Must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiProperty({ example: 'Mi Empresa S.A. de C.V.', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  companyName?: string;

  @ApiProperty({ example: 'EMP861220XXX', required: false })
  @IsOptional()
  @IsString()
  companyTaxId?: string;
}
