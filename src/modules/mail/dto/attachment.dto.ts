import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AttachmentDto {
  @ApiProperty({
    example: 'invoice.pdf',
    description: 'The filename shown to the recipient',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    example: '<base64-encoded-string>',
    description: 'File content as a base64-encoded string or Buffer',
  })
  @IsNotEmpty()
  content: string | Buffer;

  @ApiPropertyOptional({
    example: 'application/pdf',
    description: 'MIME type (auto-detected if omitted)',
  })
  @IsString()
  @IsOptional()
  contentType?: string;
}
