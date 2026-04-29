import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { DocumentsService } from '../documents/documents.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { ChatMessageDocument } from './schemas/chat-message.schema';
export declare class ChatService {
    private readonly chatMessageModel;
    private readonly documents;
    private readonly llm;
    constructor(chatMessageModel: Model<ChatMessageDocument>, documents: DocumentsService, config: ConfigService);
    ask(userId: string, dto: AskQuestionDto): Promise<{
        answer: string;
        sources: {
            documentId: unknown;
            originalName: unknown;
            chunkIndex: unknown;
            score: number;
        }[];
    }>;
    history(userId: string): Promise<{
        role: "user" | "assistant";
        content: string;
        createdAt: Date | undefined;
    }[]>;
    private recentMemory;
}
