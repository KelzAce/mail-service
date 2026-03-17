import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SendMailDto {
  @IsEmail({}, { each: true })
  to: string | string[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsObject()
  context: Record<string, unknown>;
}
