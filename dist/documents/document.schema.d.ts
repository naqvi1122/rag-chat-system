import { HydratedDocument, Types } from 'mongoose';
export type UploadedDocumentDocument = HydratedDocument<UploadedDocument>;
export declare class UploadedDocument {
    userId: Types.ObjectId;
    originalName: string;
    mimeType: string;
    storagePath: string;
    status: string;
    chunksCount: number;
    error?: string;
    processedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const UploadedDocumentSchema: import("mongoose").Schema<UploadedDocument, import("mongoose").Model<UploadedDocument, any, any, any, import("mongoose").Document<unknown, any, UploadedDocument, any, {}> & UploadedDocument & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UploadedDocument, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<UploadedDocument>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<UploadedDocument> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
