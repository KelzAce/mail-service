import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10) || 465,
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASSWORD,
  from: process.env.MAIL_FROM,
  retryAttempts: parseInt(process.env.MAIL_RETRY_ATTEMPTS, 10) || 3,
  retryDelayMs: parseInt(process.env.MAIL_RETRY_DELAY_MS, 10) || 2000,
}));
