import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicingService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(companyId: string, dto: CreateInvoiceDto) {
    if (!dto.customerId && !dto.supplierId) {
      throw new BadRequestException('Either customerId or supplierId is required');
    }

    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, companyId } });
      if (!customer) throw new NotFoundException('Customer not found');
    }
    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({ where: { id: dto.supplierId, companyId } });
      if (!supplier) throw new NotFoundException('Supplier not found');
    }

    let seq = await this.prisma.documentSequence.findUnique({
      where: { companyId_documentType: { companyId, documentType: 'INVOICE' } },
    });
    if (!seq) {
      seq = await this.prisma.documentSequence.create({
        data: { companyId, documentType: 'INVOICE', prefix: 'INV-', nextNumber: 1, length: 8 },
      });
    }

    const docNumber = `${seq.prefix}${String(seq.nextNumber).padStart(seq.length, '0')}`;

    let subtotal = 0;
    let discountTotal = 0;
    const lineData = dto.lines.map((line, idx) => {
      const lineTotal = line.quantity * line.unitPrice;
      const lineDiscount = lineTotal * (line.discount || 0) / 100;
      const lineNet = lineTotal - lineDiscount;
      subtotal += lineNet;
      discountTotal += lineDiscount;
      return {
        lineNumber: idx + 1,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount || 0,
        subtotal: lineNet,
        companyId,
      };
    });

    let taxTotal = 0;
    const taxData: any[] = [];
    for (const t of dto.taxes) {
      const tax = await this.prisma.tax.findFirst({ where: { id: t.taxId, companyId } });
      if (!tax) throw new NotFoundException(`Tax ${t.taxId} not found`);
      const amount = subtotal * Number(tax.rate) / 100;
      taxTotal += amount;
      taxData.push({
        name: tax.name,
        rate: tax.rate,
        base: subtotal,
        amount,
        taxId: tax.id,
        companyId,
      });
    }

    const total = subtotal + taxTotal;

    if (dto.currencyCode) {
      const currency = await this.prisma.currency.findFirst({ where: { code: dto.currencyCode, companyId } });
      if (!currency) throw new NotFoundException('Currency not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          documentNumber: docNumber,
          documentType: 'INVOICE',
          issueDate: dto.issueDate,
          dueDate: dto.dueDate,
          currencyCode: dto.currencyCode || 'MXN',
          exchangeRate: dto.exchangeRate || 1,
          subtotal,
          discountTotal,
          taxTotal,
          total,
          paidAmount: 0,
          balance: total,
          status: 'DRAFT',
          paymentStatus: 'PENDING',
          paymentMethod: dto.paymentMethod,
          notes: dto.notes,
          companyId,
          customerId: dto.customerId || null,
          supplierId: dto.supplierId || null,
          lines: { create: lineData },
          taxes: { create: taxData },
        },
        include: { lines: true, taxes: { include: { tax: true } } },
      });

      await tx.documentSequence.update({
        where: { companyId_documentType: { companyId, documentType: 'INVOICE' } },
        data: { nextNumber: { increment: 1 } },
      });

      return invoice;
    });
  }

  async updateInvoice(companyId: string, id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('Invoice not found');
    if (existing.status !== 'DRAFT') throw new ConflictException('Only DRAFT invoices can be updated');

    const { lines, taxes, ...data } = dto;

    if (data.customerId) {
      const customer = await this.prisma.customer.findFirst({ where: { id: data.customerId, companyId } });
      if (!customer) throw new NotFoundException('Customer not found');
    }
    if (data.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({ where: { id: data.supplierId, companyId } });
      if (!supplier) throw new NotFoundException('Supplier not found');
    }

    if (data.currencyCode) {
      const currency = await this.prisma.currency.findFirst({ where: { code: data.currencyCode, companyId } });
      if (!currency) throw new NotFoundException('Currency not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (lines || taxes) {
        let subtotal = 0;
        let discountTotal = 0;
        let taxTotal = 0;
        const safeLines = lines || [];
        const safeTaxes = taxes || [];

        const lineData = safeLines.map((line, idx) => {
          const lineTotal = line.quantity * line.unitPrice;
          const lineDiscount = lineTotal * (line.discount || 0) / 100;
          const lineNet = lineTotal - lineDiscount;
          subtotal += lineNet;
          discountTotal += lineDiscount;
          return {
            lineNumber: idx + 1,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount || 0,
            subtotal: lineNet,
            companyId,
          };
        });

        const taxData: any[] = [];
        for (const t of safeTaxes) {
          const tax = await tx.tax.findFirst({ where: { id: t.taxId, companyId } });
          if (!tax) throw new NotFoundException(`Tax ${t.taxId} not found`);
          const amount = subtotal * Number(tax.rate) / 100;
          taxTotal += amount;
          taxData.push({
            name: tax.name,
            rate: tax.rate,
            base: subtotal,
            amount,
            taxId: tax.id,
            companyId,
          });
        }

        const total = subtotal + taxTotal;

        await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
        await tx.invoiceTax.deleteMany({ where: { invoiceId: id } });

        await tx.invoice.update({
          where: { id },
          data: {
            ...data,
            subtotal,
            discountTotal,
            taxTotal,
            total,
            balance: total - Number(existing.paidAmount),
            lines: { create: lineData },
            taxes: { create: taxData },
          },
        });
      } else {
        await tx.invoice.update({ where: { id }, data });
      }

      return tx.invoice.findFirst({
        where: { id },
        include: { lines: true, taxes: { include: { tax: true } } },
      });
    });
  }

  async approveInvoice(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, companyId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status !== 'DRAFT') throw new ConflictException('Only DRAFT invoices can be approved');
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async postInvoice(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, companyId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status !== 'APPROVED') throw new ConflictException('Only APPROVED invoices can be posted');
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'POSTED' },
    });
  }

  async cancelInvoice(companyId: string, id: string, _reason: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id, companyId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'CANCELLED') throw new ConflictException('Invoice is already cancelled');
    if (Number(invoice.paidAmount) > 0) throw new ConflictException('Cannot cancel invoice with payments');
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getInvoice(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        lines: { orderBy: { lineNumber: 'asc' } },
        taxes: { include: { tax: true } },
        payments: true,
        customer: true,
        supplier: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async getInvoices(
    companyId: string,
    filters?: { status?: string; customerId?: string; dateFrom?: string; dateTo?: string },
    page = 1,
    limit = 10,
  ) {
    const where: any = { companyId };
    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.dateFrom || filters?.dateTo) {
      where.issueDate = {};
      if (filters.dateFrom) where.issueDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.issueDate.lte = new Date(filters.dateTo);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: { lines: true, taxes: { include: { tax: true } }, payments: true, customer: true, supplier: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getCustomerInvoices(customerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { customerId },
        skip,
        take: limit,
        include: { lines: true, taxes: { include: { tax: true } }, payments: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where: { customerId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getOverdueInvoices(companyId: string) {
    return this.prisma.invoice.findMany({
      where: {
        companyId,
        dueDate: { lt: new Date() },
        balance: { gt: 0 },
      },
      include: { customer: true, lines: true, payments: true },
      orderBy: { dueDate: 'asc' },
    });
  }
}
