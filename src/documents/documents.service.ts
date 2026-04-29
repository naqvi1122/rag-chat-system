import {
  BadRequestException,
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as fs from 'fs/promises';
import * as mammoth from 'mammoth';
import * as path from 'path';
import pdfParse = require('pdf-parse');
import { Model, Types } from 'mongoose';
import { VectorService } from '../vector/vector.service';
import {
  UploadedDocument,
  UploadedDocumentDocument,
} from './schemas/document.schema';

type UploadedFile = Express.Multer.File;

const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

@Injectable()
export class DocumentsService implements OnModuleInit {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly embeddings: OpenAIEmbeddings;
  private readonly splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 180,
  });

  constructor(
    @InjectModel(UploadedDocument.name)
    private readonly documentModel: Model<UploadedDocumentDocument>,
    private readonly config: ConfigService,
    private readonly vector: VectorService,
  ) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: this.config.getOrThrow<string>('OPENAI_API_KEY'),
      model: this.config.get<string>(
        'OPENAI_EMBEDDING_MODEL',
        'text-embedding-3-small',
      ),
    });
  }

  async onModuleInit() {
    await fs.mkdir(this.config.get<string>('UPLOAD_DIR', 'uploads'), {
      recursive: true,
    });
  }

  async ingest(userId: string, file?: UploadedFile) {
    if (!file) {
      throw new BadRequestException(
        'Upload a file using multipart field "file"',
      );
    }

    if (!SUPPORTED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Only PDF, DOCX, and TXT files are supported',
      );
    }

    const document = await this.createDocument(userId, file);

    try {
      const rawText = await this.extractText(file);
      const cleanText = rawText.replace(/\s+/g, ' ').trim();
      if (!cleanText) {
        throw new BadRequestException(
          'The uploaded file did not contain readable text',
        );
      }

      const chunks = await this.splitter.splitText(cleanText);
      const vectors = await this.embeddings.embedDocuments(chunks);

      await this.vector.upsertChunks(
        chunks.map((chunk, index) => ({
          vector: vectors[index],
          payload: {
            userId,
            documentId: document.id,
            originalName: file.originalname,
            chunkIndex: index,
            content: chunk,
          },
        })),
      );

      await this.documentModel
        .updateOne(
          { _id: document.id, userId: new Types.ObjectId(userId) },
          {
            $set: {
              status: 'ready',
              chunksCount: chunks.length,
              processedAt: new Date(),
            },
          },
        )
        .exec();

      return {
        id: document.id,
        originalName: file.originalname,
        status: 'ready',
        chunksCount: chunks.length,
      };
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      this.logger.error(
        `Document ingestion failed for ${file.originalname}: ${message}`,
        error?.stack,
      );

      await this.documentModel
        .updateOne(
          { _id: document.id, userId: new Types.ObjectId(userId) },
          {
            $set: {
              status: 'failed',
              error: message,
            },
          },
        )
        .exec();

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (this.isExternalServiceError(message)) {
        throw new BadGatewayException({
          message:
            'Document text was extracted, but embedding/vector processing failed',
          reason: message,
        });
      }

      throw new InternalServerErrorException({
        message: 'Failed to process uploaded file',
        reason: message,
      });
    }
  }

  async list(userId: string) {
    const documents = await this.documentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return documents.map((document) => ({
      id: String(document._id),
      originalName: document.originalName,
      mimeType: document.mimeType,
      status: document.status,
      chunksCount: document.chunksCount,
      error: document.error,
      createdAt: document.createdAt,
      processedAt: document.processedAt,
    }));
  }

  async search(userId: string, question: string, limit = 5) {
    const questionVector = await this.embeddings.embedQuery(question);
    const results = await this.vector.search(userId, questionVector, limit);

    return results.map((result) => ({
      content: String(result.payload?.content ?? ''),
      metadata: result.payload,
      score: result.score,
    }));
  }

  private async createDocument(userId: string, file: UploadedFile) {
    const document = await this.documentModel.create({
      userId: new Types.ObjectId(userId),
      originalName: file.originalname,
      mimeType: file.mimetype,
      storagePath: file.path,
      status: 'processing',
    });

    return { id: document.id };
  }

  private async extractText(file: UploadedFile): Promise<string> {
    const buffer = await fs.readFile(file.path);

    if (file.mimetype === 'application/pdf') {
      const parsed = await pdfParse(buffer);
      return parsed.text;
    }

    if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const parsed = await mammoth.extractRawText({ buffer });
      return parsed.value;
    }

    if (file.mimetype === 'text/plain') {
      return buffer.toString('utf8');
    }

    throw new BadRequestException(
      `Unsupported file extension ${path.extname(file.originalname)}`,
    );
  }

  private extractErrorMessage(error: any) {
    return (
      error?.response?.data?.error?.message ??
      error?.response?.data?.message ??
      error?.response?.statusText ??
      error?.message ??
      'Unknown ingestion error'
    );
  }

  private isExternalServiceError(message: string) {
    const normalized = message.toLowerCase();
    return (
      normalized.includes('incorrect api key') ||
      normalized.includes('openai') ||
      normalized.includes('qdrant') ||
      normalized.includes('embedding') ||
      normalized.includes('fetch failed')
    );
  }
}
