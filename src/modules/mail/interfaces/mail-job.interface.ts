export interface MailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface MailJob {
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: MailAttachment[];
}
