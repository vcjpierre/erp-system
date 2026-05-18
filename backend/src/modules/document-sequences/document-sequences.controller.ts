import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocumentSequencesService } from './document-sequences.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DocumentType } from '@prisma/client';

@ApiTags('Document Sequences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document-sequences')
export class DocumentSequencesController {
  constructor(private readonly documentSequencesService: DocumentSequencesService) {}

  @Post()
  create(
    @CurrentUser('companyId') companyId: string,
    @Body('documentType') documentType: DocumentType,
    @Body('prefix') prefix: string,
    @Body('length') length = 8,
    @Body('mask') mask?: string,
  ) {
    return this.documentSequencesService.create(companyId, documentType, prefix, length, mask);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.documentSequencesService.findAll(companyId);
  }

  @Get('next-number')
  getNextNumber(
    @CurrentUser('companyId') companyId: string,
    @Query('documentType') documentType: DocumentType,
  ) {
    return this.documentSequencesService.getNextNumber(companyId, documentType);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.documentSequencesService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() data: { prefix?: string; length?: number; mask?: string },
  ) {
    return this.documentSequencesService.update(companyId, id, data);
  }

  @Post(':id/reset')
  reset(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body('startFrom') startFrom = 1,
  ) {
    return this.documentSequencesService.resetSequence(companyId, id, startFrom);
  }
}
