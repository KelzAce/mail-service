import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailRepository } from '../repository/mail.repository';
import { SendEmailDto } from '../dto/send-email.dto';
import { MailJob } from '../interfaces/mail-job.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailRepository: MailRepository,
    private readonly configService: ConfigService,
  ) {}

  async send(dto: SendEmailDto): Promise<void> {
    const retryAttempts =
      this.configService.get<number>('mail.retryAttempts') ?? 3;
    const retryDelayMs =
      this.configService.get<number>('mail.retryDelayMs') ?? 2000;

    const job: MailJob = {
      to: Array.isArray(dto.to) ? dto.to : [dto.to],
      subject: dto.subject,
      text: dto.text,
      html: dto.html,
      from: dto.from,
      attachments: dto.attachments,
    };

    await this.sendWithRetry(job, retryAttempts, retryDelayMs);
  }

  async checkHealth(): Promise<{ ok: boolean }> {
    const ok = await this.mailRepository.verify();
    return { ok };
  }

  private async sendWithRetry(
    job: MailJob,
    maxAttempts: number,
    baseDelayMs: number,
  ): Promise<void> {
    const maxDelayMs = 30_000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.mailRepository.send(job);
        return;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (attempt < maxAttempts) {
          const delay = Math.min(
            baseDelayMs * Math.pow(2, attempt - 1),
            maxDelayMs,
          );
          this.logger.warn(
            `Send attempt ${attempt} failed: ${message}. Retrying in ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          this.logger.error(
            `Failed to send email after ${maxAttempts} attempts: ${message}`,
          );
          throw new InternalServerErrorException(
            `Failed to send email after ${maxAttempts} attempts: ${message}`,
          );
        }
      }
    }
  }
}
