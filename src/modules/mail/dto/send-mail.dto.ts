import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SendMailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Recipient email address or array of addresses',
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEmail({}, { each: true })
  to: string[];

  @ApiProperty({ example: 'Hello from the app', description: 'Email subject line' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'welcome', description: 'Handlebars template name to render' })
  @IsString()
  @IsNotEmpty()
  template: string;

  @ApiProperty({
    example: { name: 'John' },
    description: 'Template context variables passed to the Handlebars template',
  })
  @IsObject()
  context: Record<string, unknown>;
}
