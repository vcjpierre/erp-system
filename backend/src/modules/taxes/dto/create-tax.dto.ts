import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaxDto {
  @ApiProperty({ example: 'IVA' })
  @IsString()
  name: string;

  @ApiProperty({ example: 16.0 })
  @IsNumber() @Min(0) @Max(100)
  rate: number;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
