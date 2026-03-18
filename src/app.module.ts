import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mailConfig from './config/mail.config';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailConfig],
    }),
    // BullModule.forRootAsync requires a running Redis instance.
    // Commented out so the service starts and the APIs are testable without Redis.
    // Re-enable when a Redis connection is available.
    // BullModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => {
    //     const logger = new Logger('BullMQ');
    //     return {
    //       connection: {
    //         host: config.get<string>('redis.host'),
    //         port: config.get<number>('redis.port'),
    //         maxRetriesPerRequest: null,
    //         enableReadyCheck: false,
    //         lazyConnect: true,
    //         retryStrategy(times: number) {
    //           const delay = Math.min(times * 1000, 30000);
    //           logger.warn(
    //             `Redis connection attempt ${times} failed. Retrying in ${delay}ms...`,
    //           );
    //           return delay;
    //         },
    //       },
    //     };
    //   },
    // }),
    MailModule,
  ],
})
export class AppModule {}
