import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';
import { env } from '../config/env';

export const mailTemplates = {
  welcome: 'welcome',
  forgotPassword: 'forgotPassword',
  orderConfirmation: 'orderConfirmation',
} as const;

export type MailTemplateName = typeof mailTemplates[keyof typeof mailTemplates];

interface MailData {
  firstName?: string;
  lastName?: string;
  url?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  amount?: number;
  date?: string;
  number?: string;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: env.mail.server,
    secure: false,
    port: 587,
    tls: { ciphers: 'SSLv3', rejectUnauthorized: false },
    auth: { user: env.mail.address, pass: env.mail.password },
  });
}

export async function sendEmail(
  recipientEmail: string,
  templateName: string,
  data: MailData = {},
): Promise<void> {
  if (!env.mail.address || !env.mail.password) {
    throw new Error('Mail configuration is not correctly set!');
  }

  const transporter = createTransporter();
  const email = new Email({
    transport: transporter,
    send: true,
    preview: false,
    juice: true,
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.join(__dirname, '../..', 'emails/'),
        images: true,
      },
    },
  });

  try {
    await email.send({
      template: templateName,
      message: {
        from: `MercaShop ${env.mail.address}`,
        to: recipientEmail,
      },
      locals: { ...data },
    });
  } finally {
    transporter.close();
  }
}
