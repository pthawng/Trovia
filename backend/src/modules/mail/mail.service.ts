import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../database/prisma.service';

// ── Template imports ─────────────────────────────────────────────────────────
import { welcomeTemplate } from './templates/auth/welcome.template';
import { verifyEmailTemplate } from './templates/auth/verify-email.template';
import { forgotPasswordTemplate } from './templates/auth/forgot-password.template';
import { resetPasswordSuccessTemplate } from './templates/auth/reset-password-success.template';
import { rentalRequestSubmittedTemplate } from './templates/tenant/rental-request-submitted.template';
import { rentalRequestApprovedTemplate } from './templates/tenant/rental-request-approved.template';
import { contractReceivedTemplate } from './templates/tenant/contract-received.template';
import { paymentInvoiceTemplate } from './templates/tenant/payment-invoice.template';
import { paymentPaidTenantTemplate } from './templates/tenant/payment-paid.template';
import { maintenanceUpdatedTemplate } from './templates/tenant/maintenance-updated.template';
import { newRentalRequestTemplate } from './templates/landlord/new-rental-request.template';
import { contractAcceptedTemplate } from './templates/landlord/contract-accepted.template';
import { tenantPaymentPaidTemplate } from './templates/landlord/tenant-payment-paid.template';
import { maintenanceRequestTemplate } from './templates/landlord/maintenance-request.template';
import { moveOutRequestTemplate } from './templates/landlord/move-out-request.template';

export type TemplateKey =
  | 'auth.welcome'
  | 'auth.verify-email'
  | 'auth.forgot-password'
  | 'auth.reset-password-success'
  | 'tenant.rental-request-submitted'
  | 'tenant.rental-request-approved'
  | 'tenant.contract-received'
  | 'tenant.payment-invoice'
  | 'tenant.payment-paid'
  | 'tenant.maintenance-updated'
  | 'landlord.new-rental-request'
  | 'landlord.contract-accepted'
  | 'landlord.tenant-payment-paid'
  | 'landlord.maintenance-request'
  | 'landlord.move-out-request';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  templateKey: TemplateKey;
  recipientUserId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly configured: boolean;

  constructor(private readonly prisma: PrismaService) {
    const host = process.env.MAIL_HOST;

    if (!host) {
      this.logger.warn(
        '[MailService] Mail provider not configured — MAIL_HOST is missing. ' +
          'All outbound emails will be SKIPPED and logged.',
      );
      this.configured = false;
    } else {
      this.configured = true;
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
    }
  }

  // ── Core delivery engine ──────────────────────────────────────────────────

  /**
   * Central send method.
   * - Never throws — email failure MUST NOT roll back business transactions.
   * - Writes EmailLog for every attempt (SENT / FAILED / SKIPPED).
   */
  private async send(opts: SendMailOptions): Promise<void> {
    const from = `"${process.env.MAIL_FROM_NAME || 'Trovia'}" <${process.env.MAIL_FROM_EMAIL || 'no-reply@trovia.vn'}>`;

    // Create initial PENDING log
    let logId: string | null = null;
    try {
      const log = await this.prisma.emailLog.create({
        data: {
          recipientEmail: opts.to,
          recipientUserId: opts.recipientUserId ?? null,
          subject: opts.subject,
          templateKey: opts.templateKey,
          status: 'PENDING',
          metadata: opts.metadata ? (opts.metadata as any) : undefined,
        },
      });
      logId = log.id;
    } catch (dbErr) {
      // Logging failure must NOT block the send attempt
      this.logger.error('[MailService] Failed to create EmailLog entry', dbErr);
    }

    // SKIPPED — mail provider not configured
    if (!this.configured || !this.transporter) {
      this.logger.warn(
        `[MailService] SKIPPED email to ${opts.to} (templateKey=${opts.templateKey})`,
      );
      if (logId) {
        await this.prisma.emailLog.update({
          where: { id: logId },
          data: { status: 'SKIPPED' },
        });
      }
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });

      const messageId: string =
        (info as any)?.messageId ?? (info as any)?.envelope?.from ?? '';

      this.logger.log(
        `[MailService] SENT → ${opts.to} | templateKey=${opts.templateKey} | messageId=${messageId}`,
      );

      if (logId) {
        await this.prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: 'SENT',
            providerMessageId: messageId || null,
            sentAt: new Date(),
          },
        });
      }
    } catch (err: any) {
      this.logger.error(
        `[MailService] FAILED → ${opts.to} | templateKey=${opts.templateKey} | error=${err?.message}`,
        err?.stack,
      );

      if (logId) {
        await this.prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: 'FAILED',
            errorMessage: err?.message ?? 'Unknown error',
          },
        });
      }
      // Do NOT re-throw — business operation must continue
    }
  }

  // ── Preference guard ──────────────────────────────────────────────────────

  private async isEmailEnabled(
    userId: string | undefined,
    category: keyof {
      authEmailsEnabled: boolean;
      rentalEmailsEnabled: boolean;
      contractEmailsEnabled: boolean;
      paymentEmailsEnabled: boolean;
      maintenanceEmailsEnabled: boolean;
      marketingEmailsEnabled: boolean;
    },
  ): Promise<boolean> {
    if (!userId) return true; // no user = no preference = send
    try {
      const pref = await this.prisma.emailPreference.findUnique({
        where: { userId },
      });
      if (!pref) return true; // no record = default = enabled
      return pref[category] as boolean;
    } catch {
      return true; // DB error = fail open (always send)
    }
  }

  // ── AUTH EMAILS ───────────────────────────────────────────────────────────

  async sendWelcomeEmail(user: { id: string; email: string; fullName?: string | null }): Promise<void> {
    if (!(await this.isEmailEnabled(user.id, 'authEmailsEnabled'))) return;
    const { subject, html } = welcomeTemplate(user);
    await this.send({
      to: user.email,
      subject,
      html,
      templateKey: 'auth.welcome',
      recipientUserId: user.id,
    });
  }

  async sendVerifyEmail(
    user: { id: string; email: string; fullName?: string | null },
    verifyUrl: string,
  ): Promise<void> {
    if (!(await this.isEmailEnabled(user.id, 'authEmailsEnabled'))) return;
    const { subject, html } = verifyEmailTemplate(user, verifyUrl);
    await this.send({
      to: user.email,
      subject,
      html,
      templateKey: 'auth.verify-email',
      recipientUserId: user.id,
    });
  }

  async sendForgotPasswordEmail(
    user: { id: string; email: string; fullName?: string | null },
    resetUrl: string,
  ): Promise<void> {
    // Always send — do not check preference; this is a security-critical email
    const { subject, html } = forgotPasswordTemplate(user, resetUrl);
    await this.send({
      to: user.email,
      subject,
      html,
      templateKey: 'auth.forgot-password',
      recipientUserId: user.id,
    });
  }

  async sendResetPasswordSuccessEmail(user: {
    id: string;
    email: string;
    fullName?: string | null;
  }): Promise<void> {
    const { subject, html } = resetPasswordSuccessTemplate(user);
    await this.send({
      to: user.email,
      subject,
      html,
      templateKey: 'auth.reset-password-success',
      recipientUserId: user.id,
    });
  }

  // ── TENANT EMAILS ─────────────────────────────────────────────────────────

  async sendRentalRequestSubmittedEmail(
    tenant: { id: string; email: string; fullName?: string | null },
    request: { id: string; propertyTitle: string; roomTitle?: string | null },
  ): Promise<void> {
    if (!(await this.isEmailEnabled(tenant.id, 'rentalEmailsEnabled'))) return;
    const { subject, html } = rentalRequestSubmittedTemplate(tenant, request);
    await this.send({
      to: tenant.email,
      subject,
      html,
      templateKey: 'tenant.rental-request-submitted',
      recipientUserId: tenant.id,
      metadata: { rentalRequestId: request.id },
    });
  }

  async sendRentalRequestApprovedEmail(
    tenant: { id: string; email: string; fullName?: string | null },
    request: { id: string; propertyTitle: string; status: string },
  ): Promise<void> {
    if (!(await this.isEmailEnabled(tenant.id, 'rentalEmailsEnabled'))) return;
    const { subject, html } = rentalRequestApprovedTemplate(tenant, request);
    await this.send({
      to: tenant.email,
      subject,
      html,
      templateKey: 'tenant.rental-request-approved',
      recipientUserId: tenant.id,
      metadata: { rentalRequestId: request.id, status: request.status },
    });
  }

  async sendContractReceivedEmail(
    tenant: { id: string; email: string; fullName?: string | null },
    contract: {
      id: string;
      propertyTitle: string;
      monthlyRent: number;
      durationMonths: number;
      startDate: Date;
    },
  ): Promise<void> {
    if (!(await this.isEmailEnabled(tenant.id, 'contractEmailsEnabled'))) return;
    const { subject, html } = contractReceivedTemplate(tenant, contract);
    await this.send({
      to: tenant.email,
      subject,
      html,
      templateKey: 'tenant.contract-received',
      recipientUserId: tenant.id,
      metadata: { contractId: contract.id },
    });
  }

  async sendPaymentInvoiceEmail(
    tenant: { id: string; email: string; fullName?: string | null },
    payment: {
      id: string;
      propertyTitle: string;
      amount: number;
      type: string;
      dueDate: Date;
    },
  ): Promise<void> {
    if (!(await this.isEmailEnabled(tenant.id, 'paymentEmailsEnabled'))) return;
    const { subject, html } = paymentInvoiceTemplate(tenant, payment);
    await this.send({
      to: tenant.email,
      subject,
      html,
      templateKey: 'tenant.payment-invoice',
      recipientUserId: tenant.id,
      metadata: { paymentId: payment.id },
    });
  }

  async sendPaymentPaidEmail(
    recipient: { id: string; email: string; fullName?: string | null },
    payment: { id: string; propertyTitle: string; amount: number; type: string },
    role: 'tenant' | 'landlord',
  ): Promise<void> {
    if (!(await this.isEmailEnabled(recipient.id, 'paymentEmailsEnabled'))) return;
    if (role === 'tenant') {
      const { subject, html } = paymentPaidTenantTemplate(recipient, payment);
      await this.send({
        to: recipient.email,
        subject,
        html,
        templateKey: 'tenant.payment-paid',
        recipientUserId: recipient.id,
        metadata: { paymentId: payment.id },
      });
    } else {
      const { subject, html } = tenantPaymentPaidTemplate(recipient, payment);
      await this.send({
        to: recipient.email,
        subject,
        html,
        templateKey: 'landlord.tenant-payment-paid',
        recipientUserId: recipient.id,
        metadata: { paymentId: payment.id },
      });
    }
  }

  async sendMaintenanceUpdatedEmail(
    tenant: { id: string; email: string; fullName?: string | null },
    ticket: { id: string; title: string; status: string; comment?: string | null },
  ): Promise<void> {
    if (!(await this.isEmailEnabled(tenant.id, 'maintenanceEmailsEnabled'))) return;
    const { subject, html } = maintenanceUpdatedTemplate(tenant, ticket);
    await this.send({
      to: tenant.email,
      subject,
      html,
      templateKey: 'tenant.maintenance-updated',
      recipientUserId: tenant.id,
      metadata: { maintenanceId: ticket.id },
    });
  }

  // ── LANDLORD EMAILS ───────────────────────────────────────────────────────

  async sendNewRentalRequestEmail(
    landlord: { id: string; email: string; fullName?: string | null },
    request: {
      id: string;
      propertyTitle: string;
      tenantName: string;
      moveInDate: Date;
    },
  ): Promise<void> {
    if (!(await this.isEmailEnabled(landlord.id, 'rentalEmailsEnabled'))) return;
    const { subject, html } = newRentalRequestTemplate(landlord, request);
    await this.send({
      to: landlord.email,
      subject,
      html,
      templateKey: 'landlord.new-rental-request',
      recipientUserId: landlord.id,
      metadata: { rentalRequestId: request.id },
    });
  }

  async sendContractAcceptedEmail(
    landlord: { id: string; email: string; fullName?: string | null },
    contract: { id: string; propertyTitle: string; tenantName: string },
  ): Promise<void> {
    if (!(await this.isEmailEnabled(landlord.id, 'contractEmailsEnabled'))) return;
    const { subject, html } = contractAcceptedTemplate(landlord, contract);
    await this.send({
      to: landlord.email,
      subject,
      html,
      templateKey: 'landlord.contract-accepted',
      recipientUserId: landlord.id,
      metadata: { contractId: contract.id },
    });
  }

  async sendMaintenanceRequestEmail(
    landlord: { id: string; email: string; fullName?: string | null },
    ticket: {
      id: string;
      propertyTitle: string;
      tenantName: string;
      title: string;
      priority: string;
    },
  ): Promise<void> {
    if (!(await this.isEmailEnabled(landlord.id, 'maintenanceEmailsEnabled'))) return;
    const { subject, html } = maintenanceRequestTemplate(landlord, ticket);
    await this.send({
      to: landlord.email,
      subject,
      html,
      templateKey: 'landlord.maintenance-request',
      recipientUserId: landlord.id,
      metadata: { maintenanceId: ticket.id },
    });
  }

  async sendMoveOutRequestEmail(
    landlord: { id: string; email: string; fullName?: string | null },
    tenancy: { id: string; propertyTitle: string; roomTitle: string; tenantName: string },
  ): Promise<void> {
    if (!(await this.isEmailEnabled(landlord.id, 'rentalEmailsEnabled'))) return;
    const { subject, html } = moveOutRequestTemplate(landlord, tenancy);
    await this.send({
      to: landlord.email,
      subject,
      html,
      templateKey: 'landlord.move-out-request',
      recipientUserId: landlord.id,
      metadata: { tenancyId: tenancy.id },
    });
  }
}
