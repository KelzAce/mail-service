export interface MailJob {
  to: string[];
  subject: string;
  template: string;
  context: Record<string, unknown>;
}
