import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'USD' })
  @IsString() @Min(3) @Max(3)
  code: string;

  @ApiProperty({ example: 'US Dollar' })
  @IsString()
  name: string;

  @ApiProperty({ example: '$' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 1.0 })
  @IsNumber() @Min(0.000001)
  exchangeRate: number;

  @ApiProperty({ required: false })
  @IsOptional() @IsBoolean()
  isDefault?: boolean;
}
