import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { MAIL_QUEUE, MailProducer } from './queue/mail.producer';
import { MailProcessor } from './queue/mail.processor';
import { MailService } from './services/mail.service';
import { MailRepository } from './repository/mail.repository';
import { NodemailerRepository } from './repository/nodemailer.repository';
import { MailController } from './controllers/mail.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('mail.host'),
          port: config.get<number>('mail.port'),
          secure: config.get<boolean>('mail.secure'),
          auth: {
            user: config.get<string>('mail.user'),
            pass: config.get<string>('mail.pass'),
          },
        },
        defaults: {
          from: config.get<string>('mail.from'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
    BullModule.registerQueue({ name: MAIL_QUEUE }),
  ],
  controllers: [MailController],
  providers: [
    MailService,
    MailProducer,
    MailProcessor,
    {
      provide: MailRepository,
      useClass: NodemailerRepository,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
