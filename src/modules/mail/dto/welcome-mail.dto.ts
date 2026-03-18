import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class WelcomeMailDto {
  @ApiProperty({ example: 'user@example.com', description: "Recipient's email address" })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'John Doe', description: "Recipient's name" })
  @IsString()
  @IsNotEmpty()
  name: string;
}
