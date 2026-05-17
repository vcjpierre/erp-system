import { IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Almacén Central' })
  @IsString() @MinLength(2) @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'WH-001' })
  @IsString() @MinLength(2) @MaxLength(50)
  code: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  address?: string;

  @ApiProperty()
  @IsUUID()
  branchId: string;
}
