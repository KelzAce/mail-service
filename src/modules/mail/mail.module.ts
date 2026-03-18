import { Module } from '@nestjs/common';

import { MailService } from './services/mail.service';
import { DirectAdminService } from './services/directadmin.service';
import { MailRepository } from './repository/mail.repository';
import { NodemailerRepository } from './repository/nodemailer.repository';
import { MailController } from './controllers/mail.controller';
import { AccountController } from './controllers/account.controller';

@Module({
  controllers: [MailController, AccountController],
  providers: [
    MailService,
    DirectAdminService,
    {
      provide: MailRepository,
      useClass: NodemailerRepository,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
