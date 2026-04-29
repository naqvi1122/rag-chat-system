import { HydratedDocument, Types } from 'mongoose';
export type ChatMessageDocument = HydratedDocument<ChatMessage>;
export declare class ChatMessage {
    userId: Types.ObjectId;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ChatMessageSchema: import("mongoose").Schema<ChatMessage, import("mongoose").Model<ChatMessage, any, any, any, import("mongoose").Document<unknown, any, ChatMessage, any, {}> & ChatMessage & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatMessage, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ChatMessage>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ChatMessage> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
