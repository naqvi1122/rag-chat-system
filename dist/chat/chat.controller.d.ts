import { AuthUser } from '../auth/types';
import { ChatService } from './chat.service';
import { AskQuestionDto } from './dto/ask-question.dto';
export declare class ChatController {
    private readonly chat;
    constructor(chat: ChatService);
    ask(user: AuthUser, dto: AskQuestionDto): Promise<{
        answer: string;
        sources: {
            documentId: unknown;
            originalName: unknown;
            chunkIndex: unknown;
            score: number;
        }[];
    }>;
    history(user: AuthUser): Promise<{
        role: "user" | "assistant";
        content: string;
        createdAt: Date | undefined;
    }[]>;
}
