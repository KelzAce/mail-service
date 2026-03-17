export interface MailJob {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, unknown>;
}
