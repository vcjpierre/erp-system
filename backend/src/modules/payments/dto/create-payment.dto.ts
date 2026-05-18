import { IsString, IsUUID, IsOptional, IsDate, IsNumber, IsEnum, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  invoiceId: string;

  @ApiProperty({ example: 1500.00 })
  @IsNumber() @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(255)
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
