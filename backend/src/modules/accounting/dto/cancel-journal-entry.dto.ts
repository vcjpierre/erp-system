import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelJournalEntryDto {
  @ApiProperty({ example: 'Corrección por error de registro' })
  @IsString()
  @MinLength(3)
  reason: string;
}
