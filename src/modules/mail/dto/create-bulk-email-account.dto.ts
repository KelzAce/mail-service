import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateEmailAccountDto } from './create-email-account.dto';

export class CreateBulkEmailAccountDto {
  @ApiProperty({
    type: [CreateEmailAccountDto],
    description: 'Array of email accounts to create',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateEmailAccountDto)
  accounts: CreateEmailAccountDto[];
}
