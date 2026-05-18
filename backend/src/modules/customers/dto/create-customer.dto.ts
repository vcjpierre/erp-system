import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEmail, IsEnum, Min } from 'class-validator';
import { CustomerType } from '@prisma/client';

export class CreateCustomerDto {
  @ApiProperty({ example: 'C001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Cliente S.A. de C.V.' })
  @IsString()
  legalName: string;

  @ApiPropertyOptional({ example: 'Cliente' })
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiProperty({ example: 'XAXX010101000' })
  @IsString()
  taxId: string;

  @ApiPropertyOptional({ example: 'cliente@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+525555123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Calle Principal #123, Col. Centro' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: CustomerType, example: CustomerType.COMPANY })
  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @ApiPropertyOptional({ example: 50000.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditDays?: number;
}
