import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelInvoiceDto {
  @ApiProperty({ example: 'Customer requested cancellation' })
  @IsString() @MinLength(1)
  reason: string;
}
