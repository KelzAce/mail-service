import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { SendMailDto } from './send-mail.dto';

export class SendBulkMailDto {
  @ApiProperty({
    type: [SendMailDto],
    description: 'Array of emails to send',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SendMailDto)
  messages: SendMailDto[];
}
