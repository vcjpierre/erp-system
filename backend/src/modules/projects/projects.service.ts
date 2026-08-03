import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ---- Projects ----

  async findAllProjects(companyId: string) {
    return this.prisma.project.findMany({
      where: { companyId },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneProject(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        tasks: true,
        budgets: true,
        timesheets: {
          include: {
            employee: { select: { firstName: true, lastName: true } },
            task: { select: { title: true } },
          },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async createProject(companyId: string, data: any) {
    return this.prisma.project.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        status: data.status || 'PLANNING',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        budgetTotal: data.budgetTotal || 0,
        actualCost: data.actualCost || 0,
        priority: data.priority || 'MEDIUM',
        notes: data.notes,
        managerId: data.managerId,
        companyId,
      },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { tasks: true } },
      },
    });
  }

  async updateProject(id: string, data: any) {
    const existing = await this.prisma.project.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');
    delete data.companyId;
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { tasks: true } },
      },
    });
  }

  async removeProject(id: string) {
    const existing = await this.prisma.project.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');
    return this.prisma.project.delete({ where: { id } });
  }

  // ---- Tasks ----

  async findAllTasks(companyId: string, query?: any) {
    const where: any = { companyId };
    if (query?.projectId) where.projectId = query.projectId;
    if (query?.assigneeId) where.assigneeId = query.assigneeId;
    if (query?.status) where.status = query.status;
    return this.prisma.projectTask.findMany({
      where,
      include: {
        children: true,
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneTask(id: string) {
    const task = await this.prisma.projectTask.findFirst({
      where: { id },
      include: {
        children: true,
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async createTask(companyId: string, data: any) {
    return this.prisma.projectTask.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedHours: data.estimatedHours,
        actualHours: data.actualHours,
        sortOrder: data.sortOrder || 0,
        projectId: data.projectId,
        parentId: data.parentId,
        assigneeId: data.assigneeId,
        companyId,
      },
      include: {
        children: true,
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateTask(id: string, data: any) {
    const existing = await this.prisma.projectTask.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Task not found');
    delete data.companyId;
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (data.completedAt) data.completedAt = new Date(data.completedAt);
    return this.prisma.projectTask.update({
      where: { id },
      data,
      include: {
        children: true,
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async removeTask(id: string) {
    const existing = await this.prisma.projectTask.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Task not found');
    return this.prisma.projectTask.delete({ where: { id } });
  }

  async getTaskTree(projectId: string) {
    const tasks = await this.prisma.projectTask.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const task of tasks) {
      map.set(task.id, { ...task, children: [] });
    }

    for (const task of tasks) {
      const node = map.get(task.id);
      if (task.parentId && map.has(task.parentId)) {
        map.get(task.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  // ---- Timesheets ----

  async findAllTimesheets(companyId: string, query?: any) {
    const where: any = { companyId };
    if (query?.projectId) where.projectId = query.projectId;
    if (query?.employeeId) where.employeeId = query.employeeId;
    if (query?.startDate || query?.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }
    return this.prisma.projectTimesheet.findMany({
      where,
      include: {
        project: { select: { name: true } },
        task: { select: { title: true } },
        employee: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createTimesheet(companyId: string, data: any) {
    return this.prisma.projectTimesheet.create({
      data: {
        date: new Date(data.date),
        hours: data.hours,
        description: data.description,
        billable: data.billable ?? true,
        projectId: data.projectId,
        taskId: data.taskId,
        employeeId: data.employeeId,
        companyId,
      },
      include: {
        project: { select: { name: true } },
        task: { select: { title: true } },
        employee: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async updateTimesheet(id: string, data: any) {
    const existing = await this.prisma.projectTimesheet.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Timesheet not found');
    delete data.companyId;
    if (data.date) data.date = new Date(data.date);
    return this.prisma.projectTimesheet.update({
      where: { id },
      data,
      include: {
        project: { select: { name: true } },
        task: { select: { title: true } },
        employee: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async removeTimesheet(id: string) {
    const existing = await this.prisma.projectTimesheet.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Timesheet not found');
    return this.prisma.projectTimesheet.delete({ where: { id } });
  }

  // ---- Budgets ----

  async findAllBudgets(companyId: string) {
    return this.prisma.projectBudget.findMany({
      where: { companyId },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBudget(companyId: string, data: any) {
    return this.prisma.projectBudget.create({
      data: {
        category: data.category,
        planned: data.planned,
        actual: data.actual || 0,
        description: data.description,
        projectId: data.projectId,
        companyId,
      },
      include: { project: true },
    });
  }

  async updateBudget(id: string, data: any) {
    const existing = await this.prisma.projectBudget.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Budget not found');
    delete data.companyId;
    return this.prisma.projectBudget.update({
      where: { id },
      data,
      include: { project: true },
    });
  }

  async removeBudget(id: string) {
    const existing = await this.prisma.projectBudget.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Budget not found');
    return this.prisma.projectBudget.delete({ where: { id } });
  }

  // ---- Gantt ----

  async getGanttData(projectId: string) {
    return this.prisma.projectTask.findMany({
      where: { projectId },
      orderBy: [{ startDate: 'asc' }, { sortOrder: 'asc' }],
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        dueDate: true,
        priority: true,
        assigneeId: true,
        parentId: true,
      },
    });
  }

  // ---- Profitability ----

  async getProfitability(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id },
      select: { budgetTotal: true, actualCost: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const budgetTotal = Number(project.budgetTotal);
    const actualCost = Number(project.actualCost);
    const profit = budgetTotal - actualCost;
    const profitMargin = budgetTotal > 0 ? (profit / budgetTotal) * 100 : 0;

    return { budgetTotal, actualCost, profit, profitMargin };
  }
}
