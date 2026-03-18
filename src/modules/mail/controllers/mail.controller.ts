import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SendMailDto } from '../dto/send-mail.dto';
import { SendBulkMailDto } from '../dto/send-bulk-mail.dto';
import { WelcomeMailDto } from '../dto/welcome-mail.dto';
import { ResetPasswordMailDto } from '../dto/reset-password-mail.dto';
import { MailService } from '../services/mail.service';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a custom templated email' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Email queued for delivery' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request payload' })
  async send(@Body() dto: SendMailDto): Promise<{ message: string }> {
    await this.mailService.send(dto);
    return { message: 'Email queued for delivery' };
  }

  @Post('send-bulk')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send multiple emails in a single request' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'All emails queued for delivery' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request payload' })
  async sendBulk(@Body() dto: SendBulkMailDto): Promise<{ message: string; queued: number }> {
    const result = await this.mailService.sendBulk(dto.messages);
    return { message: 'Emails queued for delivery', queued: result.queued };
  }

  @Post('welcome')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a welcome email to a new user' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Welcome email queued for delivery' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request payload' })
  async sendWelcome(@Body() dto: WelcomeMailDto): Promise<{ message: string }> {
    await this.mailService.sendWelcome(dto.to, dto.name);
    return { message: 'Welcome email queued for delivery' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a password reset email' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Password reset email queued for delivery' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request payload' })
  async sendPasswordReset(@Body() dto: ResetPasswordMailDto): Promise<{ message: string }> {
    await this.mailService.sendPasswordReset(dto.to, dto.resetLink);
    return { message: 'Password reset email queued for delivery' };
  }
}
