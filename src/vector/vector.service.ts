import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { randomUUID } from 'crypto';

export type VectorPayload = {
  userId: string;
  documentId: string;
  originalName: string;
  chunkIndex: number;
  content: string;
};

@Injectable()
export class VectorService implements OnModuleInit {
  private readonly client: QdrantClient;
  private readonly collectionName: string;

  constructor(config: ConfigService) {
    this.client = new QdrantClient({
      url: config.get<string>('QDRANT_URL', 'http://localhost:6333'),
      checkCompatibility: true,
    });
    this.collectionName = config.get<string>('QDRANT_COLLECTION', 'documents');
  }

  async onModuleInit() {
    const collections = await this.client.getCollections();
    const exists = collections.collections.some(
      (collection) => collection.name === this.collectionName,
    );

    if (!exists) {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 1536,
          distance: 'Cosine',
        },
      });

      await this.client.createPayloadIndex(this.collectionName, {
        field_name: 'userId',
        field_schema: 'keyword',
      });
    }
  }

  async upsertChunks(
    chunks: Array<{ vector: number[]; payload: VectorPayload }>,
  ) {
    await this.client.upsert(this.collectionName, {
      wait: true,
      points: chunks.map((chunk) => ({
        id: randomUUID(),
        vector: chunk.vector,
        payload: chunk.payload,
      })),
    });
  }

  async search(userId: string, vector: number[], limit: number) {
    return this.client.search(this.collectionName, {
      vector,
      limit,
      with_payload: true,
      filter: {
        must: [
          {
            key: 'userId',
            match: { value: userId },
          },
        ],
      },
    });
  }
}
