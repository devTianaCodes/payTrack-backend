import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

let transporter;

export function isSmtpConfigured() {
  return Boolean(env.smtp.host);
}

export async function sendRenewalReminderEmail({ recipient, subscription, kind }) {
  if (!isSmtpConfigured()) {
    return { skipped: true, reason: 'SMTP is not configured' };
  }

  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user
      ? {
          user: env.smtp.user,
          pass: env.smtp.pass,
        }
      : undefined,
  });

  const daysUntilRenewal = kind === 'seven_days' ? 7 : 1;
  const price = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: subscription.currency,
  }).format(Number(subscription.price));

  await transporter.sendMail({
    from: env.smtp.from,
    to: recipient.email,
    subject: `${subscription.name} renews in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? '' : 's'}`,
    text: [
      `Hi ${recipient.name ?? 'there'},`,
      '',
      `${subscription.name} renews in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? '' : 's'}.`,
      `Amount: ${price}`,
      `Renewal date: ${subscription.nextRenewalDate.toISOString().slice(0, 10)}`,
      '',
      'PayTrack',
    ].join('\n'),
  });

  return { skipped: false };
}
