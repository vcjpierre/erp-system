import { IsString, IsUUID, IsOptional, IsDate, IsNumber, Min, IsArray, ValidateNested, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

class CreateInvoiceLineDto {
  @ApiProperty({ example: 'Consulting services' })
  @IsString() @MinLength(1) @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 2 })
  @IsNumber() @Min(0.0001)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 1500.50 })
  @IsNumber() @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @IsNumber() @Min(0)
  @Type(() => Number)
  discount?: number;
}

class CreateInvoiceTaxDto {
  @ApiProperty()
  @IsUUID()
  taxId: string;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  supplierId?: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  issueDate: Date;

  @ApiPropertyOptional()
  @IsOptional() @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({ default: 'MXN' })
  @IsOptional() @IsString() @MinLength(3) @MaxLength(3)
  currencyCode?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @IsNumber()
  @Type(() => Number)
  exchangeRate?: number;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional() @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateInvoiceLineDto] })
  @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines: CreateInvoiceLineDto[];

  @ApiProperty({ type: [CreateInvoiceTaxDto] })
  @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateInvoiceTaxDto)
  taxes: CreateInvoiceTaxDto[];
}
