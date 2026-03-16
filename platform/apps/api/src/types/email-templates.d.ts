declare module 'email-templates' {
  import type { Transporter } from 'nodemailer';

  interface EmailConfig {
    transport: Transporter;
    send?: boolean;
    preview?: boolean;
    message?: Record<string, unknown>;
    [key: string]: unknown;
  }

  class Email {
    constructor(config: EmailConfig);
    send(options: {
      template: string;
      message: Record<string, unknown>;
      locals?: Record<string, unknown>;
    }): Promise<void>;
  }

  export default Email;
}
