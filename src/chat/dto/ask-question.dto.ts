import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AskQuestionDto {
  @ApiProperty({
    example: 'What does this document say about refunds?',
  })
  @IsString()
  question: string;

  @ApiPropertyOptional({
    example: 5,
    minimum: 1,
    maximum: 12,
    description: 'Number of document chunks to retrieve from Qdrant.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  topK?: number;
}
