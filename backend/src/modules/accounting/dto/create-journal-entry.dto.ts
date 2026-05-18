import { IsString, IsArray, IsUUID, IsNumber, IsOptional, MinLength, ValidateNested, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class JournalEntryLineDto {
  @ApiProperty()
  @IsUUID()
  accountId: string;

  @ApiProperty({ default: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  debit: number;

  @ApiProperty({ default: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  credit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  costCenterId?: string;
}

export class CreateJournalEntryDto {
  @ApiProperty()
  @IsUUID()
  periodId: string;

  @ApiProperty({ example: 'Pago de nómina' })
  @IsString()
  @MinLength(3)
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ type: [JournalEntryLineDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines: JournalEntryLineDto[];
}
