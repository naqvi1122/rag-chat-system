import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DocumentsModule } from '../documents/documents.module';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';

@Module({
  imports: [
    DocumentsModule,
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
