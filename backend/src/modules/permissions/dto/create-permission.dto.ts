import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ModuleName, ActionType } from '@prisma/client';

export class CreatePermissionDto {
  @ApiProperty({ enum: ModuleName })
  @IsEnum(ModuleName)
  module: ModuleName;

  @ApiProperty({ enum: ActionType })
  @IsEnum(ActionType)
  action: ActionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
