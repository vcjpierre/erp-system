import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ---- Tasks ----

  @Get('tasks')
  findAllTasks(@Req() req: any, @Query() query: any) {
    return this.projectsService.findAllTasks(req.user.companyId, query);
  }

  @Get('tasks/tree/:projectId')
  getTaskTree(@Param('projectId') projectId: string) {
    return this.projectsService.getTaskTree(projectId);
  }

  @Get('tasks/:id')
  findOneTask(@Param('id') id: string) {
    return this.projectsService.findOneTask(id);
  }

  @Post('tasks')
  createTask(@Req() req: any, @Body() body: any) {
    return this.projectsService.createTask(req.user.companyId, body);
  }

  @Put('tasks/:id')
  updateTask(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.updateTask(id, body);
  }

  @Delete('tasks/:id')
  removeTask(@Param('id') id: string) {
    return this.projectsService.removeTask(id);
  }

  // ---- Timesheets ----

  @Get('timesheets')
  findAllTimesheets(@Req() req: any, @Query() query: any) {
    return this.projectsService.findAllTimesheets(req.user.companyId, query);
  }

  @Post('timesheets')
  createTimesheet(@Req() req: any, @Body() body: any) {
    return this.projectsService.createTimesheet(req.user.companyId, body);
  }

  @Put('timesheets/:id')
  updateTimesheet(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.updateTimesheet(id, body);
  }

  @Delete('timesheets/:id')
  removeTimesheet(@Param('id') id: string) {
    return this.projectsService.removeTimesheet(id);
  }

  // ---- Budgets ----

  @Get('budgets')
  findAllBudgets(@Req() req: any) {
    return this.projectsService.findAllBudgets(req.user.companyId);
  }

  @Post('budgets')
  createBudget(@Req() req: any, @Body() body: any) {
    return this.projectsService.createBudget(req.user.companyId, body);
  }

  @Put('budgets/:id')
  updateBudget(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.updateBudget(id, body);
  }

  @Delete('budgets/:id')
  removeBudget(@Param('id') id: string) {
    return this.projectsService.removeBudget(id);
  }

  // ---- Gantt ----

  @Get('gantt/:projectId')
  getGanttData(@Param('projectId') projectId: string) {
    return this.projectsService.getGanttData(projectId);
  }

  // ---- Profitability ----

  @Get('profitability/:id')
  getProfitability(@Param('id') id: string) {
    return this.projectsService.getProfitability(id);
  }

  // ---- Projects ----

  @Get()
  findAllProjects(@Req() req: any) {
    return this.projectsService.findAllProjects(req.user.companyId);
  }

  @Get(':id')
  findOneProject(@Param('id') id: string) {
    return this.projectsService.findOneProject(id);
  }

  @Post()
  createProject(@Req() req: any, @Body() body: any) {
    return this.projectsService.createProject(req.user.companyId, body);
  }

  @Put(':id')
  updateProject(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.updateProject(id, body);
  }

  @Delete(':id')
  removeProject(@Param('id') id: string) {
    return this.projectsService.removeProject(id);
  }
}
