import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SendEmailDto } from '../dto/send-email.dto';
import { MailService } from '../services/mail.service';

@ApiTags('email')
@Controller('email')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send an email via MxRoute SMTP with automatic retry' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Email was sent (or will be retried).',
    schema: { example: { message: 'Email queued and sent successfully.' } },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'All retry attempts exhausted.',
  })
  async send(@Body() dto: SendEmailDto): Promise<{ message: string }> {
    await this.mailService.send(dto);
    return { message: 'Email queued and sent successfully.' };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify SMTP connectivity to the MxRoute server' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SMTP connection status.',
    schema: { example: { ok: true } },
  })
  async health(): Promise<{ ok: boolean }> {
    return this.mailService.checkHealth();
  }
}

