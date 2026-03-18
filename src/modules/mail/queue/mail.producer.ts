import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendMailDto } from '../dto/send-mail.dto';

export const MAIL_QUEUE = 'mail';

@Injectable()
export class MailProducer implements OnModuleInit {
  private readonly logger = new Logger(MailProducer.name);

  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

  onModuleInit(): void {
    this.mailQueue.on('error', (error: Error) => {
      this.logger.error(`Queue error: ${error.message}`);
    });
  }

  async enqueue(dto: SendMailDto): Promise<void> {
    await this.mailQueue.add('send-mail', dto, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
