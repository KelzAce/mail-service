import { Injectable } from '@nestjs/common';
import { MailProducer } from '../queue/mail.producer';
import { SendMailDto } from '../dto/send-mail.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailProducer: MailProducer) {}

  async sendWelcome(to: string, name: string): Promise<void> {
    await this.mailProducer.enqueue({
      to,
      subject: 'Welcome aboard!',
      template: 'welcome',
      context: { name },
    });
  }

  async sendPasswordReset(to: string, resetLink: string): Promise<void> {
    await this.mailProducer.enqueue({
      to,
      subject: 'Reset your password',
      template: 'reset-password',
      context: { resetLink },
    });
  }

  async send(dto: SendMailDto): Promise<void> {
    await this.mailProducer.enqueue(dto);
  }
}
