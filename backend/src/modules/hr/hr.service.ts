import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async findAllDepartments(companyId: string) {
    return this.prisma.department.findMany({
      where: { companyId },
      include: { parent: true, children: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDepartment(companyId: string, data: any) {
    return this.prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        parentId: data.parentId,
        isActive: data.isActive ?? true,
        companyId,
      },
      include: { parent: true, children: true },
    });
  }

  async updateDepartment(id: string, data: any) {
    const existing = await this.prisma.department.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Department not found');
    delete data.companyId;
    return this.prisma.department.update({
      where: { id },
      data,
      include: { parent: true, children: true },
    });
  }

  async removeDepartment(id: string) {
    const existing = await this.prisma.department.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Department not found');
    return this.prisma.department.delete({ where: { id } });
  }

  async getDepartmentTree(companyId: string) {
    const departments = await this.prisma.department.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });

    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const dept of departments) {
      map.set(dept.id, { ...dept, children: [] });
    }

    for (const dept of departments) {
      if (dept.parentId && map.has(dept.parentId)) {
        map.get(dept.parentId).children.push(map.get(dept.id));
      } else {
        roots.push(map.get(dept.id));
      }
    }

    return roots;
  }

  async findAllPositions(companyId: string) {
    return this.prisma.position.findMany({
      where: { companyId },
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPosition(companyId: string, data: any) {
    return this.prisma.position.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        departmentId: data.departmentId,
        isActive: data.isActive ?? true,
        companyId,
      },
      include: { department: true },
    });
  }

  async updatePosition(id: string, data: any) {
    const existing = await this.prisma.position.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Position not found');
    delete data.companyId;
    return this.prisma.position.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  async removePosition(id: string) {
    const existing = await this.prisma.position.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Position not found');
    return this.prisma.position.delete({ where: { id } });
  }

  async findAllEmployees(companyId: string) {
    return this.prisma.employee.findMany({
      where: { companyId },
      include: {
        department: true,
        position: true,
        manager: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneEmployee(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id },
      include: {
        department: true,
        position: true,
        manager: true,
        user: true,
        contracts: true,
        attendances: true,
        leaves: true,
        evaluations: true,
        trainings: true,
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async createEmployee(companyId: string, data: any) {
    return this.prisma.employee.create({
      data: {
        code: data.code,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
        baseSalary: data.baseSalary || 0,
        afp: data.afp,
        afpRate: data.afpRate || 0,
        socialHealthRate: data.socialHealthRate || 0,
        departmentId: data.departmentId,
        positionId: data.positionId,
        managerId: data.managerId,
        userId: data.userId,
        isActive: data.isActive ?? true,
        notes: data.notes,
        companyId,
      },
      include: {
        department: true,
        position: true,
        manager: true,
      },
    });
  }

  async updateEmployee(id: string, data: any) {
    const existing = await this.prisma.employee.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Employee not found');
    delete data.companyId;
    if (data.hireDate) data.hireDate = new Date(data.hireDate);
    if (data.terminationDate) data.terminationDate = new Date(data.terminationDate);
    return this.prisma.employee.update({
      where: { id },
      data,
      include: {
        department: true,
        position: true,
        manager: true,
      },
    });
  }

  async removeEmployee(id: string) {
    const existing = await this.prisma.employee.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Employee not found');
    return this.prisma.employee.delete({ where: { id } });
  }

  async findAllContracts(companyId: string) {
    return this.prisma.contract.findMany({
      where: { companyId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneContract(id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id },
      include: { employee: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async createContract(companyId: string, data: any) {
    return this.prisma.contract.create({
      data: {
        type: data.type,
        status: data.status || 'ACTIVE',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        salary: data.salary,
        workingHours: data.workingHours || 40,
        position: data.position,
        notes: data.notes,
        employeeId: data.employeeId,
        companyId,
      },
      include: { employee: true },
    });
  }

  async updateContract(id: string, data: any) {
    const existing = await this.prisma.contract.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Contract not found');
    delete data.companyId;
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return this.prisma.contract.update({
      where: { id },
      data,
      include: { employee: true },
    });
  }

  async removeContract(id: string) {
    const existing = await this.prisma.contract.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Contract not found');
    return this.prisma.contract.delete({ where: { id } });
  }

  async findAllAttendance(companyId: string, query?: any) {
    const where: any = { companyId };
    if (query?.employeeId) where.employeeId = query.employeeId;
    if (query?.startDate || query?.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }
    return this.prisma.attendance.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
  }

  async createAttendance(companyId: string, data: any) {
    return this.prisma.attendance.create({
      data: {
        date: data.date ? new Date(data.date) : new Date(),
        checkIn: data.checkIn ? new Date(data.checkIn) : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
        hoursWorked: data.hoursWorked,
        isAbsent: data.isAbsent ?? false,
        notes: data.notes,
        employeeId: data.employeeId,
        companyId,
      },
      include: { employee: true },
    });
  }

  async updateAttendance(id: string, data: any) {
    const existing = await this.prisma.attendance.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Attendance record not found');
    if (data.checkIn) data.checkIn = new Date(data.checkIn);
    if (data.checkOut) data.checkOut = new Date(data.checkOut);
    if (data.date) data.date = new Date(data.date);
    return this.prisma.attendance.update({
      where: { id },
      data,
      include: { employee: true },
    });
  }

  async removeAttendance(id: string) {
    const existing = await this.prisma.attendance.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Attendance record not found');
    return this.prisma.attendance.delete({ where: { id } });
  }

  async findAllLeaves(companyId: string, query?: any) {
    const where: any = { companyId };
    if (query?.employeeId) where.employeeId = query.employeeId;
    if (query?.status) where.status = query.status;
    return this.prisma.leave.findMany({
      where,
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeave(companyId: string, data: any) {
    return this.prisma.leave.create({
      data: {
        type: data.type,
        status: data.status || 'PENDING',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        days: data.days,
        reason: data.reason,
        employeeId: data.employeeId,
        companyId,
      },
      include: { employee: true },
    });
  }

  async updateLeave(id: string, data: any) {
    const existing = await this.prisma.leave.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Leave not found');
    delete data.companyId;
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return this.prisma.leave.update({
      where: { id },
      data,
      include: { employee: true },
    });
  }

  async approveLeave(id: string, approvedBy: string) {
    const existing = await this.prisma.leave.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Leave not found');
    return this.prisma.leave.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy,
      },
      include: { employee: true },
    });
  }

  async rejectLeave(id: string, approvedBy: string) {
    const existing = await this.prisma.leave.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Leave not found');
    return this.prisma.leave.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedAt: new Date(),
        approvedBy,
      },
      include: { employee: true },
    });
  }

  async removeLeave(id: string) {
    const existing = await this.prisma.leave.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Leave not found');
    return this.prisma.leave.delete({ where: { id } });
  }

  async findAllHolidays(companyId: string) {
    return this.prisma.holiday.findMany({
      where: { companyId },
      orderBy: { date: 'asc' },
    });
  }

  async createHoliday(companyId: string, data: any) {
    return this.prisma.holiday.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        isRecurring: data.isRecurring ?? false,
        companyId,
      },
    });
  }

  async findAllPayrolls(companyId: string) {
    return this.prisma.payroll.findMany({
      where: { companyId },
      include: {
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePayroll(id: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id },
      include: {
        lines: {
          include: { employee: true },
        },
      },
    });
    if (!payroll) throw new NotFoundException('Payroll not found');
    return payroll;
  }

  async createPayroll(companyId: string, data: any) {
    const { bonuses, overtime, ...header } = data;

    const payroll = await this.prisma.payroll.create({
      data: {
        periodStart: new Date(header.periodStart),
        periodEnd: new Date(header.periodEnd),
        status: 'DRAFT',
        notes: header.notes,
        companyId,
      },
    });

    const employees = await this.prisma.employee.findMany({
      where: { companyId, isActive: true },
      include: {
        contracts: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });

    let totalSalary = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    for (const employee of employees) {
      if (employee.contracts.length === 0) continue;

      const baseSalary = Number(employee.baseSalary);
      const empBonuses = Number(bonuses?.[employee.id] || 0);
      const empOvertime = Number(overtime?.[employee.id] || 0);
      const grossSalary = baseSalary + empOvertime + empBonuses;
      const afpRate = Number(employee.afpRate || 0);
      const socialHealthRate = Number(employee.socialHealthRate || 0);
      const afpAmount = grossSalary * afpRate / 100;
      const socialHealth = grossSalary * socialHealthRate / 100;
      const incomeTax = grossSalary * 0.10;
      const deductions = afpAmount + socialHealth + incomeTax;
      const netSalary = grossSalary - deductions;

      totalSalary += grossSalary;
      totalDeductions += deductions;
      totalNet += netSalary;

      await this.prisma.payrollLine.create({
        data: {
          payrollId: payroll.id,
          employeeId: employee.id,
          grossSalary,
          bonuses: empBonuses,
          overtime: empOvertime,
          afpAmount,
          socialHealth,
          incomeTax,
          deductions,
          netSalary,
          companyId,
        },
      });
    }

    await this.prisma.payroll.update({
      where: { id: payroll.id },
      data: {
        totalSalary,
        totalDeductions,
        totalNet,
      },
    });

    return this.prisma.payroll.findFirst({
      where: { id: payroll.id },
      include: {
        lines: { include: { employee: true } },
      },
    });
  }

  async updatePayroll(id: string, data: any) {
    const existing = await this.prisma.payroll.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Payroll not found');
    delete data.companyId;
    if (data.periodStart) data.periodStart = new Date(data.periodStart);
    if (data.periodEnd) data.periodEnd = new Date(data.periodEnd);
    return this.prisma.payroll.update({
      where: { id },
      data,
      include: {
        lines: { include: { employee: true } },
      },
    });
  }

  async calculatePayroll(id: string) {
    const payroll = await this.prisma.payroll.findFirst({ where: { id } });
    if (!payroll) throw new NotFoundException('Payroll not found');

    const lines = await this.prisma.payrollLine.findMany({
      where: { payrollId: id },
      include: { employee: true },
    });

    let totalSalary = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    for (const line of lines) {
      const grossSalary = Number(line.grossSalary);
      const afpRate = Number(line.employee.afpRate || 0);
      const socialHealthRate = Number(line.employee.socialHealthRate || 0);
      const afpAmount = grossSalary * afpRate / 100;
      const socialHealth = grossSalary * socialHealthRate / 100;
      const incomeTax = grossSalary * 0.10;
      const deductions = afpAmount + socialHealth + incomeTax;
      const netSalary = grossSalary - deductions;

      totalSalary += grossSalary;
      totalDeductions += deductions;
      totalNet += netSalary;

      await this.prisma.payrollLine.update({
        where: { id: line.id },
        data: { afpAmount, socialHealth, incomeTax, deductions, netSalary },
      });
    }

    return this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'CALCULATED',
        totalSalary,
        totalDeductions,
        totalNet,
      },
      include: {
        lines: { include: { employee: true } },
      },
    });
  }

  async payPayroll(id: string) {
    const existing = await this.prisma.payroll.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Payroll not found');

    return this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        lines: { include: { employee: true } },
      },
    });
  }

  async removePayroll(id: string) {
    const existing = await this.prisma.payroll.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Payroll not found');
    return this.prisma.payroll.delete({ where: { id } });
  }

  async findAllEvaluations(companyId: string, query?: any) {
    const where: any = { companyId };
    if (query?.employeeId) where.employeeId = query.employeeId;
    return this.prisma.evaluation.findMany({
      where,
      include: {
        employee: true,
        reviewer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEvaluation(companyId: string, data: any) {
    return this.prisma.evaluation.create({
      data: {
        period: data.period,
        score: data.score,
        reviewerNotes: data.reviewerNotes,
        status: data.status || 'DRAFT',
        evaluatedAt: data.evaluatedAt ? new Date(data.evaluatedAt) : null,
        employeeId: data.employeeId,
        reviewerId: data.reviewerId,
        companyId,
      },
      include: {
        employee: true,
        reviewer: true,
      },
    });
  }

  async updateEvaluation(id: string, data: any) {
    const existing = await this.prisma.evaluation.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Evaluation not found');
    delete data.companyId;
    if (data.evaluatedAt) data.evaluatedAt = new Date(data.evaluatedAt);
    return this.prisma.evaluation.update({
      where: { id },
      data,
      include: {
        employee: true,
        reviewer: true,
      },
    });
  }

  async removeEvaluation(id: string) {
    const existing = await this.prisma.evaluation.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Evaluation not found');
    return this.prisma.evaluation.delete({ where: { id } });
  }

  async findAllRecruitments(companyId: string) {
    return this.prisma.recruitment.findMany({
      where: { companyId },
      include: {
        position: true,
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneRecruitment(id: string) {
    const recruitment = await this.prisma.recruitment.findFirst({
      where: { id },
      include: {
        position: true,
        candidates: true,
      },
    });
    if (!recruitment) throw new NotFoundException('Recruitment not found');
    return recruitment;
  }

  async createRecruitment(companyId: string, data: any) {
    return this.prisma.recruitment.create({
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        status: data.status || 'DRAFT',
        openings: data.openings || 1,
        positionId: data.positionId,
        companyId,
      },
      include: {
        position: true,
        _count: { select: { candidates: true } },
      },
    });
  }

  async updateRecruitment(id: string, data: any) {
    const existing = await this.prisma.recruitment.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Recruitment not found');
    delete data.companyId;
    return this.prisma.recruitment.update({
      where: { id },
      data,
      include: {
        position: true,
        _count: { select: { candidates: true } },
      },
    });
  }

  async removeRecruitment(id: string) {
    const existing = await this.prisma.recruitment.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Recruitment not found');
    return this.prisma.recruitment.delete({ where: { id } });
  }

  async findCandidates(recruitmentId: string) {
    return this.prisma.candidate.findMany({
      where: { recruitmentId },
      include: { recruitment: true },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async createCandidate(companyId: string, data: any) {
    return this.prisma.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        cv: data.cv,
        status: data.status || 'NEW',
        interviewNotes: data.interviewNotes,
        recruitmentId: data.recruitmentId,
        companyId,
      },
      include: { recruitment: true },
    });
  }

  async updateCandidate(id: string, data: any) {
    const existing = await this.prisma.candidate.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Candidate not found');
    delete data.companyId;
    if (data.status === 'HIRED') data.hiredAt = new Date();
    return this.prisma.candidate.update({
      where: { id },
      data,
      include: { recruitment: true },
    });
  }

  async removeCandidate(id: string) {
    const existing = await this.prisma.candidate.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Candidate not found');
    return this.prisma.candidate.delete({ where: { id } });
  }

  async findAllTrainings(companyId: string, query?: any) {
    const where: any = { companyId };
    if (query?.employeeId) where.employeeId = query.employeeId;
    return this.prisma.training.findMany({
      where,
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTraining(companyId: string, data: any) {
    return this.prisma.training.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        hours: data.hours,
        completed: data.completed ?? false,
        notes: data.notes,
        employeeId: data.employeeId,
        companyId,
      },
      include: { employee: true },
    });
  }

  async updateTraining(id: string, data: any) {
    const existing = await this.prisma.training.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Training not found');
    delete data.companyId;
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return this.prisma.training.update({
      where: { id },
      data,
      include: { employee: true },
    });
  }

  async removeTraining(id: string) {
    const existing = await this.prisma.training.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException('Training not found');
    return this.prisma.training.delete({ where: { id } });
  }
}
