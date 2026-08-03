import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HrService } from './hr.service';

@UseGuards(JwtAuthGuard)
@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('departments')
  findAllDepartments(@Req() req: any) {
    return this.hrService.findAllDepartments(req.user.companyId);
  }

  @Post('departments')
  createDepartment(@Req() req: any, @Body() body: any) {
    return this.hrService.createDepartment(req.user.companyId, body);
  }

  @Put('departments/:id')
  updateDepartment(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateDepartment(id, body);
  }

  @Delete('departments/:id')
  removeDepartment(@Param('id') id: string) {
    return this.hrService.removeDepartment(id);
  }

  @Get('departments/tree')
  getDepartmentTree(@Req() req: any) {
    return this.hrService.getDepartmentTree(req.user.companyId);
  }

  @Get('positions')
  findAllPositions(@Req() req: any) {
    return this.hrService.findAllPositions(req.user.companyId);
  }

  @Post('positions')
  createPosition(@Req() req: any, @Body() body: any) {
    return this.hrService.createPosition(req.user.companyId, body);
  }

  @Put('positions/:id')
  updatePosition(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updatePosition(id, body);
  }

  @Delete('positions/:id')
  removePosition(@Param('id') id: string) {
    return this.hrService.removePosition(id);
  }

  @Get('employees')
  findAllEmployees(@Req() req: any) {
    return this.hrService.findAllEmployees(req.user.companyId);
  }

  @Get('employees/:id')
  findOneEmployee(@Param('id') id: string) {
    return this.hrService.findOneEmployee(id);
  }

  @Post('employees')
  createEmployee(@Req() req: any, @Body() body: any) {
    return this.hrService.createEmployee(req.user.companyId, body);
  }

  @Put('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateEmployee(id, body);
  }

  @Delete('employees/:id')
  removeEmployee(@Param('id') id: string) {
    return this.hrService.removeEmployee(id);
  }

  @Get('contracts')
  findAllContracts(@Req() req: any) {
    return this.hrService.findAllContracts(req.user.companyId);
  }

  @Get('contracts/:id')
  findOneContract(@Param('id') id: string) {
    return this.hrService.findOneContract(id);
  }

  @Post('contracts')
  createContract(@Req() req: any, @Body() body: any) {
    return this.hrService.createContract(req.user.companyId, body);
  }

  @Put('contracts/:id')
  updateContract(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateContract(id, body);
  }

  @Delete('contracts/:id')
  removeContract(@Param('id') id: string) {
    return this.hrService.removeContract(id);
  }

  @Get('attendance')
  findAllAttendance(@Req() req: any, @Query() query: any) {
    return this.hrService.findAllAttendance(req.user.companyId, query);
  }

  @Post('attendance')
  createAttendance(@Req() req: any, @Body() body: any) {
    return this.hrService.createAttendance(req.user.companyId, body);
  }

  @Put('attendance/:id')
  updateAttendance(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateAttendance(id, body);
  }

  @Delete('attendance/:id')
  removeAttendance(@Param('id') id: string) {
    return this.hrService.removeAttendance(id);
  }

  @Get('leaves')
  findAllLeaves(@Req() req: any, @Query() query: any) {
    return this.hrService.findAllLeaves(req.user.companyId, query);
  }

  @Post('leaves')
  createLeave(@Req() req: any, @Body() body: any) {
    return this.hrService.createLeave(req.user.companyId, body);
  }

  @Put('leaves/:id')
  updateLeave(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateLeave(id, body);
  }

  @Post('leaves/:id/approve')
  approveLeave(@Param('id') id: string, @Req() req: any) {
    return this.hrService.approveLeave(id, req.user.id);
  }

  @Post('leaves/:id/reject')
  rejectLeave(@Param('id') id: string, @Req() req: any) {
    return this.hrService.rejectLeave(id, req.user.id);
  }

  @Delete('leaves/:id')
  removeLeave(@Param('id') id: string) {
    return this.hrService.removeLeave(id);
  }

  @Get('holidays')
  findAllHolidays(@Req() req: any) {
    return this.hrService.findAllHolidays(req.user.companyId);
  }

  @Post('holidays')
  createHoliday(@Req() req: any, @Body() body: any) {
    return this.hrService.createHoliday(req.user.companyId, body);
  }

  @Get('payrolls')
  findAllPayrolls(@Req() req: any) {
    return this.hrService.findAllPayrolls(req.user.companyId);
  }

  @Get('payrolls/:id')
  findOnePayroll(@Param('id') id: string) {
    return this.hrService.findOnePayroll(id);
  }

  @Post('payrolls')
  createPayroll(@Req() req: any, @Body() body: any) {
    return this.hrService.createPayroll(req.user.companyId, body);
  }

  @Put('payrolls/:id')
  updatePayroll(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updatePayroll(id, body);
  }

  @Post('payrolls/:id/calculate')
  calculatePayroll(@Param('id') id: string) {
    return this.hrService.calculatePayroll(id);
  }

  @Post('payrolls/:id/pay')
  payPayroll(@Param('id') id: string) {
    return this.hrService.payPayroll(id);
  }

  @Delete('payrolls/:id')
  removePayroll(@Param('id') id: string) {
    return this.hrService.removePayroll(id);
  }

  @Get('evaluations')
  findAllEvaluations(@Req() req: any, @Query() query: any) {
    return this.hrService.findAllEvaluations(req.user.companyId, query);
  }

  @Post('evaluations')
  createEvaluation(@Req() req: any, @Body() body: any) {
    return this.hrService.createEvaluation(req.user.companyId, body);
  }

  @Put('evaluations/:id')
  updateEvaluation(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateEvaluation(id, body);
  }

  @Delete('evaluations/:id')
  removeEvaluation(@Param('id') id: string) {
    return this.hrService.removeEvaluation(id);
  }

  @Get('recruitments')
  findAllRecruitments(@Req() req: any) {
    return this.hrService.findAllRecruitments(req.user.companyId);
  }

  @Get('recruitments/:id')
  findOneRecruitment(@Param('id') id: string) {
    return this.hrService.findOneRecruitment(id);
  }

  @Post('recruitments')
  createRecruitment(@Req() req: any, @Body() body: any) {
    return this.hrService.createRecruitment(req.user.companyId, body);
  }

  @Put('recruitments/:id')
  updateRecruitment(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateRecruitment(id, body);
  }

  @Delete('recruitments/:id')
  removeRecruitment(@Param('id') id: string) {
    return this.hrService.removeRecruitment(id);
  }

  @Get('recruitments/:id/candidates')
  findCandidates(@Param('id') id: string) {
    return this.hrService.findCandidates(id);
  }

  @Post('candidates')
  createCandidate(@Req() req: any, @Body() body: any) {
    return this.hrService.createCandidate(req.user.companyId, body);
  }

  @Put('candidates/:id')
  updateCandidate(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateCandidate(id, body);
  }

  @Delete('candidates/:id')
  removeCandidate(@Param('id') id: string) {
    return this.hrService.removeCandidate(id);
  }

  @Get('trainings')
  findAllTrainings(@Req() req: any, @Query() query: any) {
    return this.hrService.findAllTrainings(req.user.companyId, query);
  }

  @Post('trainings')
  createTraining(@Req() req: any, @Body() body: any) {
    return this.hrService.createTraining(req.user.companyId, body);
  }

  @Put('trainings/:id')
  updateTraining(@Param('id') id: string, @Body() body: any) {
    return this.hrService.updateTraining(id, body);
  }

  @Delete('trainings/:id')
  removeTraining(@Param('id') id: string) {
    return this.hrService.removeTraining(id);
  }
}
