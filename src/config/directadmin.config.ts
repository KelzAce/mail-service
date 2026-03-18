import { registerAs } from '@nestjs/config';

export default registerAs('directadmin', () => ({
  host: process.env.DA_HOST,
  port: parseInt(process.env.DA_PORT, 10) || 2222,
  username: process.env.DA_USERNAME,
  password: process.env.DA_PASSWORD,
  domain: process.env.DA_DOMAIN,
}));
