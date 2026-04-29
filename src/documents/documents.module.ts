import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import {
  UploadedDocument,
  UploadedDocumentSchema,
} from './schemas/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UploadedDocument.name, schema: UploadedDocumentSchema },
    ]),
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dest: config.get<string>('UPLOAD_DIR', 'uploads'),
        limits: {
          fileSize:
            Number(config.get<string>('MAX_UPLOAD_MB', '20')) * 1024 * 1024,
        },
        storage: diskStorage({
          destination: config.get<string>('UPLOAD_DIR', 'uploads'),
          filename: (_req, file, callback) => {
            callback(null, `${randomUUID()}${extname(file.originalname)}`);
          },
        }),
      }),
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
