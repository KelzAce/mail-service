import { MailJob } from '../interfaces/mail-job.interface';

export abstract class MailRepository {
  abstract send(job: MailJob): Promise<void>;
  abstract verify(): Promise<boolean>;
}
