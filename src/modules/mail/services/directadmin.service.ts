import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateEmailAccountDto } from '../dto/create-email-account.dto';

export interface AccountResult {
  username: string;
  email: string;
  success: boolean;
  message: string;
}

@Injectable()
export class DirectAdminService {
  private readonly logger = new Logger(DirectAdminService.name);
  private readonly baseUrl: string;
  private readonly auth: { username: string; password: string };
  private readonly domain: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('directadmin.host');
    const port = this.config.get<number>('directadmin.port');
    this.baseUrl = `https://${host}:${port}`;
    this.auth = {
      username: this.config.get<string>('directadmin.username'),
      password: this.config.get<string>('directadmin.password'),
    };
    this.domain = this.config.get<string>('directadmin.domain');
  }

  async createAccount(dto: CreateEmailAccountDto): Promise<AccountResult> {
    const email = `${dto.username}@${this.domain}`;

    try {
      const params = new URLSearchParams({
        action: 'create',
        domain: this.domain,
        user: dto.username,
        passwd: dto.password,
        passwd2: dto.password,
        quota: String(dto.quota ?? 0),
      });

      const response = await axios.post(
        `${this.baseUrl}/CMD_API_POP`,
        params.toString(),
        {
          auth: this.auth,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        },
      );

      const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const isError = data.includes('error=1');

      if (isError) {
        const match = data.match(/text=([^&]+)/);
        const message = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : 'Unknown error';
        this.logger.warn(`Failed to create ${email}: ${message}`);
        return { username: dto.username, email, success: false, message };
      }

      this.logger.log(`Created email account: ${email}`);
      return { username: dto.username, email, success: true, message: 'Account created' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      this.logger.error(`Error creating ${email}: ${message}`);
      return { username: dto.username, email, success: false, message };
    }
  }

  async createAccounts(accounts: CreateEmailAccountDto[]): Promise<AccountResult[]> {
    const results: AccountResult[] = [];
    for (const account of accounts) {
      results.push(await this.createAccount(account));
    }
    return results;
  }

  async listAccounts(): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        action: 'list',
        domain: this.domain,
      });

      const response = await axios.get(`${this.baseUrl}/CMD_API_POP`, {
        params,
        auth: this.auth,
        timeout: 10000,
      });

      const data = typeof response.data === 'string' ? response.data : '';
      // DirectAdmin returns list=account1&list=account2 format
      const matches = data.match(/list=([^&\n]+)/g) || [];
      return matches.map((m: string) => `${m.replace('list=', '')}@${this.domain}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      this.logger.error(`Error listing accounts: ${message}`);
      throw error;
    }
  }

  async deleteAccount(username: string): Promise<AccountResult> {
    const email = `${username}@${this.domain}`;

    try {
      const params = new URLSearchParams({
        action: 'delete',
        domain: this.domain,
        user: username,
      });

      const response = await axios.post(
        `${this.baseUrl}/CMD_API_POP`,
        params.toString(),
        {
          auth: this.auth,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        },
      );

      const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const isError = data.includes('error=1');

      if (isError) {
        const match = data.match(/text=([^&]+)/);
        const message = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : 'Unknown error';
        return { username, email, success: false, message };
      }

      this.logger.log(`Deleted email account: ${email}`);
      return { username, email, success: true, message: 'Account deleted' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      this.logger.error(`Error deleting ${email}: ${message}`);
      return { username, email, success: false, message };
    }
  }
}
