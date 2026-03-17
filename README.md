# Mail Service

A NestJS enterprise email templating service using [MXRoute](https://mxroute.com) as the SMTP provider, with BullMQ-backed queue processing and Handlebars templates.

---

## Table of Contents

- [Overview](#overview)
- [MXRoute Email Setup](#mxroute-email-setup)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Email Templates](#email-templates)
- [Usage](#usage)
- [Queue & Retry Logic](#queue--retry-logic)

---

## Overview

This service provides a reliable, queue-backed email delivery pipeline:

1. **MailService** — exposes high-level methods (`sendWelcome`, `sendPasswordReset`, `send`)
2. **MailProducer** — enqueues jobs into a BullMQ Redis queue
3. **MailProcessor** — consumes jobs from the queue and delegates to the repository
4. **NodemailerRepository** — sends the actual email via Nodemailer / MXRoute SMTP

---

## MXRoute Email Setup

[MXRoute](https://mxroute.com) is a budget email hosting provider that supports standard SMTP. Follow these steps to obtain your credentials and configure the service.

### 1. Purchase a plan and create a mailbox

1. Sign up or log in at [mxroute.com](https://mxroute.com).
2. From the **Accounts** or **Email Accounts** section in your hosting control panel (cPanel / DirectAdmin), create a new mailbox, e.g. `noreply@yourdomain.com`.
3. Set a strong password for the mailbox — you will use it as `MAIL_PASS`.

### 2. Find your SMTP hostname

MXRoute assigns a dedicated server hostname to each account (e.g. `mail.mxrouting.net` or a server-specific hostname like `us-east.mxrouting.net`).

You can find the correct hostname in:

- The **Welcome email** MXRoute sent when you signed up, **or**
- Your hosting control panel → **Email** → **Configure Email Client**.

Use that hostname as `MAIL_HOST`.

### 3. SMTP settings

| Setting   | Recommended value          | Notes                              |
|-----------|----------------------------|------------------------------------|
| Host      | `mail.mxrouting.net`       | Use your server-specific hostname  |
| Port      | `465`                      | SSL/TLS (recommended)              |
| Secure    | `true`                     | Required for port 465              |
| Username  | `you@yourdomain.com`       | Full mailbox address               |
| Password  | `your_mxroute_password`    | Mailbox password                   |

> **Alternative port:** Port `587` with STARTTLS (`MAIL_SECURE=false`) is also supported by MXRoute if port 465 is blocked by your network.

### 4. Verify DNS records (recommended)

For reliable delivery, ensure the following DNS records are set for your domain in your DNS provider:

| Type  | Name / Host        | Value                                      |
|-------|--------------------|--------------------------------------------|
| MX    | `@`                | `ext-mx##.mxrouting.net` (provided by MXRoute) |
| SPF   | `@`                | `v=spf1 include:mxrouting.net ~all`        |
| DKIM  | `x._domainkey`     | TXT value provided in your control panel   |
| DMARC | `_dmarc`           | `v=DMARC1; p=none; rua=mailto:you@yourdomain.com` |

---

## Project Structure

```
src/
├── app.module.ts
├── main.ts
├── config/
│   ├── mail.config.ts        # MAIL_* env vars
│   └── redis.config.ts       # REDIS_* env vars
└── modules/
    └── mail/
        ├── mail.module.ts
        ├── dto/
        │   └── send-mail.dto.ts
        ├── interfaces/
        │   └── mail-job.interface.ts
        ├── queue/
        │   ├── mail.producer.ts   # Enqueues jobs
        │   └── mail.processor.ts  # Processes jobs
        ├── repository/
        │   ├── mail.repository.ts         # Abstract base
        │   └── nodemailer.repository.ts   # Nodemailer impl
        ├── services/
        │   └── mail.service.ts
        └── templates/
            ├── welcome/
            │   └── welcome.hbs
            └── reset-password/
                └── reset-password.hbs
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable     | Description                                      | Example                              |
|--------------|--------------------------------------------------|--------------------------------------|
| `MAIL_HOST`  | MXRoute SMTP hostname                            | `mail.mxrouting.net`                 |
| `MAIL_PORT`  | SMTP port (`465` for SSL, `587` for STARTTLS)    | `465`                                |
| `MAIL_SECURE`| `true` for SSL/TLS (port 465), `false` otherwise | `true`                               |
| `MAIL_USER`  | Your full MXRoute mailbox address                | `noreply@yourdomain.com`             |
| `MAIL_PASS`  | Your MXRoute mailbox password                    | `your_mxroute_password`              |
| `MAIL_FROM`  | Sender display name and address                  | `"My App <noreply@yourdomain.com>"`  |
| `REDIS_HOST` | Redis hostname for BullMQ                        | `localhost`                          |
| `REDIS_PORT` | Redis port                                       | `6379`                               |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Redis (for the BullMQ queue)

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run start:dev
```

### Build and run in production

```bash
npm run build
npm run start:prod
```

The service listens on **port 3000** by default.

---

## Email Templates

Templates are Handlebars (`.hbs`) files located in `src/modules/mail/templates/`.

| Template name    | File path                                   | Context variables    |
|------------------|---------------------------------------------|----------------------|
| `welcome`        | `templates/welcome/welcome.hbs`             | `name`               |
| `reset-password` | `templates/reset-password/reset-password.hbs` | `resetLink`        |

### Adding a new template

1. Create a new folder under `src/modules/mail/templates/<template-name>/`.
2. Add a `<template-name>.hbs` file with your HTML and Handlebars expressions.
3. Call `mailService.send({ to, subject, template: '<template-name>', context: { ... } })`.

---

## Usage

Inject `MailService` into any NestJS provider or controller:

```typescript
import { MailService } from './modules/mail/services/mail.service';

@Injectable()
export class AuthService {
  constructor(private readonly mailService: MailService) {}

  async register(user: User) {
    // Send a welcome email
    await this.mailService.sendWelcome(user.email, user.name);
  }

  async forgotPassword(email: string, resetLink: string) {
    // Send a password reset email
    await this.mailService.sendPasswordReset(email, resetLink);
  }

  async sendCustomMail() {
    // Send any template-based email
    await this.mailService.send({
      to: 'recipient@example.com',
      subject: 'Hello from Mail Service',
      template: 'welcome',
      context: { name: 'Alice' },
    });
  }
}
```

### `SendMailDto` fields

| Field      | Type                   | Required | Description                                  |
|------------|------------------------|----------|----------------------------------------------|
| `to`       | `string \| string[]`   | Yes      | Recipient email address(es)                  |
| `subject`  | `string`               | Yes      | Email subject line                           |
| `template` | `string`               | Yes      | Name of the Handlebars template to render    |
| `context`  | `Record<string, any>`  | Yes      | Variables passed to the Handlebars template  |

---

## Queue & Retry Logic

Emails are processed asynchronously via a **BullMQ** queue backed by Redis.

- **Queue name:** `mail`
- **Retry attempts:** 3
- **Backoff strategy:** Exponential, starting at 5 seconds
- **On success:** Job is automatically removed from the queue
- **On failure:** Job is kept in the queue for inspection

This ensures transient SMTP failures (e.g. MXRoute rate limits or temporary network issues) are retried automatically without losing messages.
