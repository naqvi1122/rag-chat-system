import { AuthUser } from '../auth/types';
import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documents;
    constructor(documents: DocumentsService);
    upload(user: AuthUser, file: Express.Multer.File): Promise<{
        id: any;
        originalName: string;
        status: string;
        chunksCount: number;
    }>;
    list(user: AuthUser): Promise<{
        id: string;
        originalName: string;
        mimeType: string;
        status: string;
        chunksCount: number;
        error: string | undefined;
        createdAt: Date | undefined;
        processedAt: Date | undefined;
    }[]>;
}
