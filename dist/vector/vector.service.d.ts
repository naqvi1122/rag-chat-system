import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export type VectorPayload = {
    userId: string;
    documentId: string;
    originalName: string;
    chunkIndex: number;
    content: string;
};
export declare class VectorService implements OnModuleInit {
    private readonly client;
    private readonly collectionName;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    upsertChunks(chunks: Array<{
        vector: number[];
        payload: VectorPayload;
    }>): Promise<void>;
    search(userId: string, vector: number[], limit: number): Promise<{
        id: import("@qdrant/js-client-rest/dist/types/openapi/generated_schema").components["schemas"]["ExtendedPointId"];
        version: number;
        score: number;
        payload?: import("@qdrant/js-client-rest/dist/types/openapi/generated_schema").components["schemas"]["Payload"] | (Record<string, unknown> | null);
        vector?: import("@qdrant/js-client-rest/dist/types/openapi/generated_schema").components["schemas"]["VectorStructOutput"] | (Record<string, unknown> | null);
        shard_key?: import("@qdrant/js-client-rest/dist/types/openapi/generated_schema").components["schemas"]["ShardKey"] | (Record<string, unknown> | null);
        order_value?: import("@qdrant/js-client-rest/dist/types/openapi/generated_schema").components["schemas"]["OrderValue"] | (Record<string, unknown> | null);
    }[]>;
}
