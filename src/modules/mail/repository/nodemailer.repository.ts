import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailRepository } from './mail.repository';
import { MailJob } from '../interfaces/mail-job.interface';

@Injectable()
export class NodemailerRepository implements MailRepository {
  constructor(private readonly mailerService: MailerService) {}

  async send(job: MailJob): Promise<void> {
    await this.mailerService.sendMail({
      to: job.to,
      subject: job.subject,
      template: job.template,
      context: job.context,
    });
  }
}
