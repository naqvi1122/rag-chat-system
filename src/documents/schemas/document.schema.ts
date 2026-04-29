import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UploadedDocumentDocument = HydratedDocument<UploadedDocument>;

@Schema({ timestamps: true, collection: 'documents' })
export class UploadedDocument {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  storagePath: string;

  @Prop({
    required: true,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing',
  })
  status: string;

  @Prop({ required: true, default: 0 })
  chunksCount: number;

  @Prop()
  error?: string;

  @Prop()
  processedAt?: Date;

  createdAt?: Date;

  updatedAt?: Date;
}

export const UploadedDocumentSchema =
  SchemaFactory.createForClass(UploadedDocument);
