import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @Prop({ required: true })
  content: string;

  createdAt?: Date;

  updatedAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
