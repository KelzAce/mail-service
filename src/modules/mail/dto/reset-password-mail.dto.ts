import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsUrl } from 'class-validator';

export class ResetPasswordMailDto {
  @ApiProperty({ example: 'user@example.com', description: "Recipient's email address" })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'https://example.com/reset?token=abc123', description: 'Password reset link' })
  @IsUrl()
  resetLink: string;
}
