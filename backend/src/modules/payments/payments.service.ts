import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async registerPayment(companyId: string, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: dto.invoiceId, companyId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (Number(invoice.balance) <= 0) throw new ConflictException('Invoice is already fully paid');
    if (invoice.status !== 'POSTED') throw new ConflictException('Cannot register payment for non-posted invoice');

    const paymentNumber = `PAY-${Date.now()}`;
    const newPaidAmount = Number(invoice.paidAmount) + dto.amount;
    const newBalance = Number(invoice.total) - newPaidAmount;

    if (dto.amount > Number(invoice.balance)) {
      throw new BadRequestException('Payment amount exceeds invoice balance');
    }

    const paymentStatus = newBalance <= 0 ? 'COMPLETED' : 'PARTIAL';

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          amount: dto.amount,
          paymentDate: dto.paymentDate,
          paymentMethod: dto.paymentMethod,
          reference: dto.reference,
          notes: dto.notes,
          companyId,
          invoiceId: dto.invoiceId,
          customerId: dto.customerId || invoice.customerId,
        },
        include: { invoice: true },
      });

      await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balance: newBalance,
          paymentStatus: paymentStatus as any,
        },
      });

      return payment;
    });
  }

  async getPayments(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { companyId },
        skip,
        take: limit,
        include: { invoice: true, customer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where: { companyId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getInvoicePayments(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.payment.findMany({
      where: { invoiceId },
      include: { customer: true },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
