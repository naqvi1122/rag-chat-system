import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/types';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and process a PDF, DOCX, or TXT document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF, DOCX, or TXT file',
        },
      },
      required: ['file'],
    },
  })
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documents.ingest(user.id, file);
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded documents for the logged-in user' })
  list(@CurrentUser() user: AuthUser) {
    return this.documents.list(user.id);
  }
}
