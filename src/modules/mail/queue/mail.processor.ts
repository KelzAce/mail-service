import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MAIL_QUEUE } from './mail.producer';
import { MailRepository } from '../repository/mail.repository';
import { MailJob } from '../interfaces/mail-job.interface';

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailRepository: MailRepository) {
    super();
  }

  async process(job: Job<MailJob>): Promise<void> {
    this.logger.log(`Processing mail job [${job.id}] → ${job.data.to}`);

    try {
      await this.mailRepository.send(job.data);
      this.logger.log(`Mail job [${job.id}] delivered successfully`);
    } catch (error) {
      this.logger.error(`Mail job [${job.id}] failed: ${error.message}`);
      throw error;
    }
  }

  @OnWorkerEvent('error')
  onError(error: Error): void {
    this.logger.error(`Worker error: ${error.message}`);
  }
}
