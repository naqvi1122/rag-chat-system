"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const openai_1 = require("@langchain/openai");
const messages_1 = require("@langchain/core/messages");
const mongoose_2 = require("mongoose");
const documents_service_1 = require("../documents/documents.service");
const chat_message_schema_1 = require("./schemas/chat-message.schema");
let ChatService = class ChatService {
    chatMessageModel;
    documents;
    llm;
    constructor(chatMessageModel, documents, config) {
        this.chatMessageModel = chatMessageModel;
        this.documents = documents;
        this.llm = new openai_1.ChatOpenAI({
            apiKey: config.getOrThrow('OPENAI_API_KEY'),
            model: config.get('OPENAI_CHAT_MODEL', 'gpt-4o-mini'),
            temperature: 0.2,
        });
    }
    async ask(userId, dto) {
        const topK = dto.topK ?? 5;
        const [contextChunks, memory] = await Promise.all([
            this.documents.search(userId, dto.question, topK),
            this.recentMemory(userId),
        ]);
        const context = contextChunks
            .map((chunk, index) => {
            const source = chunk.metadata?.originalName ?? 'uploaded document';
            return `[Source ${index + 1}: ${source}]\n${chunk.content}`;
        })
            .join('\n\n');
        const messages = [
            new messages_1.SystemMessage([
                'You are a customer support RAG agent.',
                'Answer only from the uploaded user documents and the conversation history.',
                'If the answer is not available in the documents, say you could not find it in the uploaded files.',
                'Be concise, clear, and helpful.',
            ].join(' ')),
            new messages_1.SystemMessage(`Retrieved document context:\n${context || 'No document context found.'}`),
            ...memory.map((message) => message.role === 'user'
                ? new messages_1.HumanMessage(message.content)
                : new messages_1.AIMessage(message.content)),
            new messages_1.HumanMessage(dto.question),
        ];
        const response = await this.llm.invoke(messages);
        const answer = String(response.content);
        await this.chatMessageModel.insertMany([
            {
                userId: new mongoose_2.Types.ObjectId(userId),
                role: 'user',
                content: dto.question,
            },
            {
                userId: new mongoose_2.Types.ObjectId(userId),
                role: 'assistant',
                content: answer,
            },
        ]);
        return {
            answer,
            sources: contextChunks.map((chunk) => ({
                documentId: chunk.metadata?.documentId,
                originalName: chunk.metadata?.originalName,
                chunkIndex: chunk.metadata?.chunkIndex,
                score: Number(chunk.score),
            })),
        };
    }
    async history(userId) {
        const messages = await this.chatMessageModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: 1 })
            .lean()
            .exec();
        return messages.map((message) => ({
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,
        }));
    }
    async recentMemory(userId) {
        const messages = await this.chatMessageModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(12)
            .lean()
            .exec();
        return messages.reverse().map((message) => ({
            role: message.role,
            content: message.content,
        }));
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_message_schema_1.ChatMessage.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        documents_service_1.DocumentsService,
        config_1.ConfigService])
], ChatService);
//# sourceMappingURL=chat.service.js.map