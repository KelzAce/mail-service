import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AttachmentDto } from './attachment.dto';

export class SendEmailDto {
  @ApiProperty({
    example: 'recipient@example.com',
    description: 'Recipient email address or array of addresses',
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEmail({}, { each: true })
  to: string | string[];

  @ApiProperty({
    example: 'Hello from MxRoute Mailer',
    description: 'Email subject line',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({
    example: 'This is a plain text email.',
    description: 'Plain text body. At least one of text or html is recommended.',
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({
    example: '<h1>Hello!</h1>',
    description: 'HTML body. Takes visual precedence over text in most clients.',
  })
  @IsString()
  @IsOptional()
  html?: string;

  @ApiPropertyOptional({
    example: 'custom-sender@yourdomain.com',
    description: 'Override the default sender. Falls back to MAIL_FROM env var.',
  })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    type: [AttachmentDto],
    description: 'List of file attachments.',
  })
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];
}
