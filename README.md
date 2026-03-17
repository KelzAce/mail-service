# Mail Service

NestJS enterprise email templating service using [MXRoute](https://mxroute.com/) as the SMTP provider.

## Features

- **MXRoute SMTP integration** — reliable email delivery via `mail.mxrouting.net`
- **Queue-based processing** — asynchronous email dispatch with BullMQ and Redis
- **Handlebars templates** — dynamic HTML emails with reusable templates
- **Automatic retries** — failed jobs retry up to 3 times with exponential backoff
- **Validation** — request payload validation with `class-validator`

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Redis](https://redis.io/) running locally or remotely
- An [MXRoute](https://mxroute.com/) account with SMTP credentials

## MXRoute Email Setup

MXRoute is an email hosting provider that offers SMTP access for sending emails. To configure this service with your MXRoute account:

1. **Get your MXRoute SMTP credentials** from the MXRoute client area (e.g., DirectAdmin or cPanel).
2. **SMTP settings** for MXRoute:
   | Setting  | Value                  |
   | -------- | ---------------------- |
   | Host     | `mail.mxrouting.net`   |
   | Port     | `465`                  |
   | Security | SSL/TLS (`secure: true`) |
   | Username | Your full email address (e.g., `you@yourdomain.com`) |
   | Password | Your MXRoute email password |

3. **Copy `.env.example` to `.env`** and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

4. **Edit `.env`** with your MXRoute details:

   ```env
   MAIL_HOST=mail.mxrouting.net
   MAIL_PORT=465
   MAIL_SECURE=true
   MAIL_USER=you@yourdomain.com
   MAIL_PASS=your_mxroute_password
   MAIL_FROM="Your App <you@yourdomain.com>"

   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

> **Note:** The `MAIL_FROM` address must match a valid mailbox on your MXRoute account.

## Installation

```bash
npm install
```

## Running the Service

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The service listens on port **3000** by default.

## Environment Variables

| Variable      | Description                              | Default             |
| ------------- | ---------------------------------------- | ------------------- |
| `MAIL_HOST`   | MXRoute SMTP server hostname             | —                   |
| `MAIL_PORT`   | SMTP port                                | `465`               |
| `MAIL_SECURE` | Use TLS/SSL (`true` or `false`)          | `true`              |
| `MAIL_USER`   | MXRoute email address                    | —                   |
| `MAIL_PASS`   | MXRoute email password                   | —                   |
| `MAIL_FROM`   | Default sender address                   | —                   |
| `REDIS_HOST`  | Redis server hostname                    | `localhost`         |
| `REDIS_PORT`  | Redis server port                        | `6379`              |

## Email Templates

Templates use [Handlebars](https://handlebarsjs.com/) and are located in `src/modules/mail/templates/`.

| Template         | Variables       | Description              |
| ---------------- | --------------- | ------------------------ |
| `welcome`        | `{{name}}`      | Welcome email for new users |
| `reset-password` | `{{resetLink}}` | Password reset with a link |

To add a new template, create a directory under `src/modules/mail/templates/` with an `.hbs` file:

```
src/modules/mail/templates/
├── welcome/
│   └── welcome.hbs
├── reset-password/
│   └── reset-password.hbs
└── your-template/
    └── your-template.hbs
```

## Usage

Inject `MailService` into your NestJS controllers or services:

```typescript
import { MailService } from './modules/mail/services/mail.service';

@Controller('users')
export class UsersController {
  constructor(private readonly mailService: MailService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    // ... create user
    await this.mailService.sendWelcome(body.email, body.name);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    // ... generate reset token
    await this.mailService.sendPasswordReset(body.email, resetLink);
  }
}
```

You can also send custom emails with the generic `send` method:

```typescript
await this.mailService.send({
  to: 'recipient@example.com',
  subject: 'Custom Subject',
  template: 'your-template',
  context: { key: 'value' },
});
```

## Architecture

```
Request → MailService → MailProducer → BullMQ (Redis) → MailProcessor → NodemailerRepository → MXRoute SMTP
```

- **MailService** — public API with convenience methods (`sendWelcome`, `sendPasswordReset`, `send`)
- **MailProducer** — enqueues email jobs to a BullMQ queue
- **MailProcessor** — consumes jobs from the queue and delegates to the repository
- **NodemailerRepository** — sends emails via Nodemailer using the configured MXRoute SMTP transport
- **MailRepository** — abstract class allowing alternative email provider implementations

## Project Structure

```
src/
├── main.ts                              # Application entry point
├── app.module.ts                        # Root module
├── config/
│   ├── mail.config.ts                   # Mail provider configuration
│   └── redis.config.ts                  # Redis configuration
└── modules/
    └── mail/
        ├── mail.module.ts               # Mail module definition
        ├── dto/
        │   └── send-mail.dto.ts         # Request validation
        ├── interfaces/
        │   └── mail-job.interface.ts     # Job payload interface
        ├── queue/
        │   ├── mail.producer.ts         # Queue producer
        │   └── mail.processor.ts        # Queue consumer
        ├── repository/
        │   ├── mail.repository.ts       # Abstract repository
        │   └── nodemailer.repository.ts # Nodemailer implementation
        ├── services/
        │   └── mail.service.ts          # Service layer
        └── templates/
            ├── welcome/
            │   └── welcome.hbs
            └── reset-password/
                └── reset-password.hbs
```

## License

MIT
