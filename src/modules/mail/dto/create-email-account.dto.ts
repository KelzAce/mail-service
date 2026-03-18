import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEmailAccountDto {
  @ApiProperty({ example: 'john', description: 'Username part of the email (before @)' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password for the email account' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 0, description: 'Mailbox quota in MB (0 = unlimited)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quota?: number = 0;
}
