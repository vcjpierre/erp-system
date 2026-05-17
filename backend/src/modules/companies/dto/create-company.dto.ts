import { IsString, MinLength, MaxLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Mi Empresa S.A. de C.V.' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  legalName: string;

  @ApiProperty({ example: 'Mi Empresa' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  tradeName: string;

  @ApiProperty({ example: 'EMP861220XXX' })
  @IsString()
  @MinLength(10)
  @MaxLength(50)
  taxId: string;

  @ApiProperty({ example: 'contacto@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;
}
