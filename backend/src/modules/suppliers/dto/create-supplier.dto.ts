import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEmail, Min } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'S001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Proveedor S.A. de C.V.' })
  @IsString()
  legalName: string;

  @ApiPropertyOptional({ example: 'Proveedor' })
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiProperty({ example: 'XAXX010101000' })
  @IsString()
  taxId: string;

  @ApiPropertyOptional({ example: 'proveedor@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+525555123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Principal #456, Col. Industrial' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditDays?: number;
}
