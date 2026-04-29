import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { Model, Types } from 'mongoose';
import { DocumentsService } from '../documents/documents.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import {
  ChatMessage,
  ChatMessageDocument,
} from './schemas/chat-message.schema';

@Injectable()
export class ChatService {
  private readonly llm: ChatOpenAI;

  constructor(
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
    private readonly documents: DocumentsService,
    config: ConfigService,
  ) {
    this.llm = new ChatOpenAI({
      apiKey: config.getOrThrow<string>('OPENAI_API_KEY'),
      model: config.get<string>('OPENAI_CHAT_MODEL', 'gpt-4o-mini'),
      temperature: 0.2,
    });
  }

  async ask(userId: string, dto: AskQuestionDto) {
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
      new SystemMessage(
        [
          'You are a customer support RAG agent.',
          'Answer only from the uploaded user documents and the conversation history.',
          'If the answer is not available in the documents, say you could not find it in the uploaded files.',
          'Be concise, clear, and helpful.',
        ].join(' '),
      ),
      new SystemMessage(
        `Retrieved document context:\n${context || 'No document context found.'}`,
      ),
      ...memory.map((message) =>
        message.role === 'user'
          ? new HumanMessage(message.content)
          : new AIMessage(message.content),
      ),
      new HumanMessage(dto.question),
    ];

    const response = await this.llm.invoke(messages);
    const answer = String(response.content);

    await this.chatMessageModel.insertMany([
      {
        userId: new Types.ObjectId(userId),
        role: 'user',
        content: dto.question,
      },
      {
        userId: new Types.ObjectId(userId),
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

  async history(userId: string) {
    const messages = await this.chatMessageModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return messages.map((message) => ({
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    }));
  }

  private async recentMemory(userId: string) {
    const messages = await this.chatMessageModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
      .exec();

    return messages.reverse().map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }
}
