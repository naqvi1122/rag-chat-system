import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { VectorService } from '../vector/vector.service';
import { UploadedDocumentDocument } from './schemas/document.schema';
type UploadedFile = Express.Multer.File;
export declare class DocumentsService implements OnModuleInit {
    private readonly documentModel;
    private readonly config;
    private readonly vector;
    private readonly logger;
    private readonly embeddings;
    private readonly splitter;
    constructor(documentModel: Model<UploadedDocumentDocument>, config: ConfigService, vector: VectorService);
    onModuleInit(): Promise<void>;
    ingest(userId: string, file?: UploadedFile): Promise<{
        id: any;
        originalName: string;
        status: string;
        chunksCount: number;
    }>;
    list(userId: string): Promise<{
        id: string;
        originalName: string;
        mimeType: string;
        status: string;
        chunksCount: number;
        error: string | undefined;
        createdAt: Date | undefined;
        processedAt: Date | undefined;
    }[]>;
    search(userId: string, question: string, limit?: number): Promise<{
        content: string;
        metadata: Record<string, unknown> | {
            [key: string]: unknown;
        } | null | undefined;
        score: number;
    }[]>;
    private createDocument;
    private extractText;
    private extractErrorMessage;
    private isExternalServiceError;
}
export {};
