import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const host = (this.config.get<string>('SMTP_HOST') ?? '').trim();
    const portRaw = (this.config.get<string>('SMTP_PORT') ?? '').trim();
    const port = Number.parseInt(portRaw || '0', 10);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const secure =
      (this.config.get<string>('SMTP_SECURE') ?? 'false') === 'true';

    const missing: string[] = [];
    if (!host) missing.push('SMTP_HOST');
    if (!port || Number.isNaN(port)) missing.push('SMTP_PORT');

    if (missing.length > 0) {
      throw new InternalServerErrorException(
        `Email service is not configured (missing: ${missing.join(', ')})`,
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });

    return this.transporter;
  }

  async sendPasswordResetEmail(params: {
    to: string;
    name?: string;
    resetUrl: string;
  }): Promise<void> {
    const from =
      this.config.get<string>('SMTP_FROM') ??
      this.config.get<string>('SMTP_USER') ??
      'no-reply@example.com';

    const appName = this.config.get<string>('APP_NAME') ?? 'Subscription App';

    const subject = `${appName}: Reset your password`;

    const safeName = params.name?.trim() || 'there';

    const text = [
      `Hi ${safeName},`,
      '',
      'We received a request to reset your password.',
      `Reset it using this link (valid for a limited time): ${params.resetUrl}`,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n');

    const html = `
      <p>Hi ${this.escapeHtml(safeName)},</p>
      <p>We received a request to reset your password.</p>
      <p><a href="${this.escapeAttr(params.resetUrl)}">Click here to reset your password</a></p>
      <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
      <p><code>${this.escapeHtml(params.resetUrl)}</code></p>
      <p>If you did not request this, you can ignore this email.</p>
    `.trim();

    const transporter = this.getTransporter();

    await transporter.sendMail({
      from,
      to: params.to,
      subject,
      text,
      html,
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttr(value: string): string {
    // for href/src contexts
    return this.escapeHtml(value);
  }
}
