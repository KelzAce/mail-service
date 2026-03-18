import { Injectable, Logger } from '@nestjs/common';
import { MailRepository } from '../repository/mail.repository';
import { SendMailDto } from '../dto/send-mail.dto';

// MailProducer is commented out – re-enable together with BullMQ / Redis.
// import { MailProducer } from '../queue/mail.producer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailRepository: MailRepository) {}

  async sendWelcome(to: string, name: string): Promise<void> {
    this.dispatch({
      to,
      subject: 'Welcome aboard!',
      template: 'welcome',
      context: { name },
    });
  }

  async sendPasswordReset(to: string, resetLink: string): Promise<void> {
    this.dispatch({
      to,
      subject: 'Reset your password',
      template: 'reset-password',
      context: { resetLink },
    });
  }

  async send(dto: SendMailDto): Promise<void> {
    this.dispatch(dto);
  }

  async sendBulk(messages: SendMailDto[]): Promise<{ queued: number }> {
    for (const dto of messages) {
      this.dispatch(dto);
    }
    return { queued: messages.length };
  }

  /** Fire-and-forget: sends asynchronously so the HTTP caller always gets 202. */
  private dispatch(dto: SendMailDto): void {
    this.mailRepository.send(dto).catch((err: Error) => {
      this.logger.error(`Mail send failed: ${err.message}`, err.stack);
    });
  }
}
