import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmailAccountDto } from '../dto/create-email-account.dto';
import { CreateBulkEmailAccountDto } from '../dto/create-bulk-email-account.dto';
import { DirectAdminService, AccountResult } from '../services/directadmin.service';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly daService: DirectAdminService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a single email account on the domain' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Account creation result' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request payload' })
  async create(@Body() dto: CreateEmailAccountDto): Promise<AccountResult> {
    return this.daService.createAccount(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple email accounts on the domain' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Bulk account creation results' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request payload' })
  async createBulk(@Body() dto: CreateBulkEmailAccountDto): Promise<AccountResult[]> {
    return this.daService.createAccounts(dto.accounts);
  }

  @Get()
  @ApiOperation({ summary: 'List all email accounts on the domain' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of email addresses' })
  async list(): Promise<string[]> {
    return this.daService.listAccounts();
  }

  @Delete(':username')
  @ApiOperation({ summary: 'Delete an email account from the domain' })
  @ApiParam({ name: 'username', description: 'Username part of the email (before @)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Account deletion result' })
  async remove(@Param('username') username: string): Promise<AccountResult> {
    return this.daService.deleteAccount(username);
  }
}
