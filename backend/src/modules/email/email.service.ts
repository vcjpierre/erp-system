import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendMail(options: { to: string; subject: string; html: string; text?: string }) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${(error as Error).message}`);
      throw error;
    }
  }

  async sendPasswordReset(email: string, resetToken: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    return this.sendMail({
      to: email,
      subject: 'Password Reset - ERP System',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="padding:12px 24px;background:#0066cc;color:white;text-decoration:none;border-radius:4px;display:inline-block;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
  }

  async sendWelcome(email: string, name: string, companyName: string) {
    return this.sendMail({
      to: email,
      subject: `Welcome to ERP System - ${companyName}`,
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Your account for <strong>${companyName}</strong> has been created.</p>
        <p>You can now log in to access all ERP features.</p>
      `,
    });
  }
}
