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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const js_client_rest_1 = require("@qdrant/js-client-rest");
const crypto_1 = require("crypto");
let VectorService = class VectorService {
    client;
    collectionName;
    constructor(config) {
        this.client = new js_client_rest_1.QdrantClient({
            url: config.get('QDRANT_URL', 'http://localhost:6333'),
            checkCompatibility: true,
        });
        this.collectionName = config.get('QDRANT_COLLECTION', 'documents');
    }
    async onModuleInit() {
        const collections = await this.client.getCollections();
        const exists = collections.collections.some((collection) => collection.name === this.collectionName);
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
    async upsertChunks(chunks) {
        await this.client.upsert(this.collectionName, {
            wait: true,
            points: chunks.map((chunk) => ({
                id: (0, crypto_1.randomUUID)(),
                vector: chunk.vector,
                payload: chunk.payload,
            })),
        });
    }
    async search(userId, vector, limit) {
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
};
exports.VectorService = VectorService;
exports.VectorService = VectorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VectorService);
//# sourceMappingURL=vector.service.js.map