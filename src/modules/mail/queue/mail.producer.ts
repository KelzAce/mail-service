import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendMailDto } from '../dto/send-mail.dto';

export const MAIL_QUEUE = 'mail';

@Injectable()
export class MailProducer {
  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

  async enqueue(dto: SendMailDto): Promise<void> {
    await this.mailQueue.add('send-mail', dto, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
