import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import mailConfig from './config/mail.config';
import redisConfig from './config/redis.config';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailConfig, redisConfig],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('BullMQ');
        return {
          connection: {
            host: config.get<string>('redis.host'),
            port: config.get<number>('redis.port'),
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            lazyConnect: true,
            retryStrategy(times: number) {
              const delay = Math.min(times * 1000, 30000);
              logger.warn(
                `Redis connection attempt ${times} failed. Retrying in ${delay}ms...`,
              );
              return delay;
            },
          },
        };
      },
    }),
    MailModule,
  ],
})
export class AppModule {}
