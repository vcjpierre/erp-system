import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClosePeriodDto {
  @ApiProperty({ example: 'current-password' })
  @IsString()
  password: string;
}
