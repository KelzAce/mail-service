import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailRepository } from './mail.repository';
import { MailJob } from '../interfaces/mail-job.interface';

@Injectable()
export class NodemailerRepository implements MailRepository {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('mail.host'),
      port: configService.get<number>('mail.port'),
      secure: configService.get<boolean>('mail.secure'),
      auth: {
        user: configService.get<string>('mail.user'),
        pass: configService.get<string>('mail.pass'),
      },
    });
  }

  async send(job: MailJob): Promise<void> {
    await this.transporter.sendMail({
      from: job.from ?? this.configService.get<string>('mail.from'),
      to: job.to,
      subject: job.subject,
      text: job.text,
      html: job.html,
      attachments: job.attachments,
    });
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
