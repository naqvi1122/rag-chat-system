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
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const openai_1 = require("@langchain/openai");
const textsplitters_1 = require("@langchain/textsplitters");
const fs = require("fs/promises");
const mammoth = require("mammoth");
const path = require("path");
const pdfParse = require("pdf-parse");
const mongoose_2 = require("mongoose");
const vector_service_1 = require("../vector/vector.service");
const document_schema_1 = require("./schemas/document.schema");
const SUPPORTED_MIME_TYPES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
]);
let DocumentsService = DocumentsService_1 = class DocumentsService {
    documentModel;
    config;
    vector;
    logger = new common_1.Logger(DocumentsService_1.name);
    embeddings;
    splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 180,
    });
    constructor(documentModel, config, vector) {
        this.documentModel = documentModel;
        this.config = config;
        this.vector = vector;
        this.embeddings = new openai_1.OpenAIEmbeddings({
            apiKey: this.config.getOrThrow('OPENAI_API_KEY'),
            model: this.config.get('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small'),
        });
    }
    async onModuleInit() {
        await fs.mkdir(this.config.get('UPLOAD_DIR', 'uploads'), {
            recursive: true,
        });
    }
    async ingest(userId, file) {
        if (!file) {
            throw new common_1.BadRequestException('Upload a file using multipart field "file"');
        }
        if (!SUPPORTED_MIME_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException('Only PDF, DOCX, and TXT files are supported');
        }
        const document = await this.createDocument(userId, file);
        try {
            const rawText = await this.extractText(file);
            const cleanText = rawText.replace(/\s+/g, ' ').trim();
            if (!cleanText) {
                throw new common_1.BadRequestException('The uploaded file did not contain readable text');
            }
            const chunks = await this.splitter.splitText(cleanText);
            const vectors = await this.embeddings.embedDocuments(chunks);
            await this.vector.upsertChunks(chunks.map((chunk, index) => ({
                vector: vectors[index],
                payload: {
                    userId,
                    documentId: document.id,
                    originalName: file.originalname,
                    chunkIndex: index,
                    content: chunk,
                },
            })));
            await this.documentModel
                .updateOne({ _id: document.id, userId: new mongoose_2.Types.ObjectId(userId) }, {
                $set: {
                    status: 'ready',
                    chunksCount: chunks.length,
                    processedAt: new Date(),
                },
            })
                .exec();
            return {
                id: document.id,
                originalName: file.originalname,
                status: 'ready',
                chunksCount: chunks.length,
            };
        }
        catch (error) {
            const message = this.extractErrorMessage(error);
            this.logger.error(`Document ingestion failed for ${file.originalname}: ${message}`, error?.stack);
            await this.documentModel
                .updateOne({ _id: document.id, userId: new mongoose_2.Types.ObjectId(userId) }, {
                $set: {
                    status: 'failed',
                    error: message,
                },
            })
                .exec();
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (this.isExternalServiceError(message)) {
                throw new common_1.BadGatewayException({
                    message: 'Document text was extracted, but embedding/vector processing failed',
                    reason: message,
                });
            }
            throw new common_1.InternalServerErrorException({
                message: 'Failed to process uploaded file',
                reason: message,
            });
        }
    }
    async list(userId) {
        const documents = await this.documentModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return documents.map((document) => ({
            id: String(document._id),
            originalName: document.originalName,
            mimeType: document.mimeType,
            status: document.status,
            chunksCount: document.chunksCount,
            error: document.error,
            createdAt: document.createdAt,
            processedAt: document.processedAt,
        }));
    }
    async search(userId, question, limit = 5) {
        const questionVector = await this.embeddings.embedQuery(question);
        const results = await this.vector.search(userId, questionVector, limit);
        return results.map((result) => ({
            content: String(result.payload?.content ?? ''),
            metadata: result.payload,
            score: result.score,
        }));
    }
    async createDocument(userId, file) {
        const document = await this.documentModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            originalName: file.originalname,
            mimeType: file.mimetype,
            storagePath: file.path,
            status: 'processing',
        });
        return { id: document.id };
    }
    async extractText(file) {
        const buffer = await fs.readFile(file.path);
        if (file.mimetype === 'application/pdf') {
            const parsed = await pdfParse(buffer);
            return parsed.text;
        }
        if (file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const parsed = await mammoth.extractRawText({ buffer });
            return parsed.value;
        }
        if (file.mimetype === 'text/plain') {
            return buffer.toString('utf8');
        }
        throw new common_1.BadRequestException(`Unsupported file extension ${path.extname(file.originalname)}`);
    }
    extractErrorMessage(error) {
        return (error?.response?.data?.error?.message ??
            error?.response?.data?.message ??
            error?.response?.statusText ??
            error?.message ??
            'Unknown ingestion error');
    }
    isExternalServiceError(message) {
        const normalized = message.toLowerCase();
        return (normalized.includes('incorrect api key') ||
            normalized.includes('openai') ||
            normalized.includes('qdrant') ||
            normalized.includes('embedding') ||
            normalized.includes('fetch failed'));
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(document_schema_1.UploadedDocument.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService,
        vector_service_1.VectorService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map