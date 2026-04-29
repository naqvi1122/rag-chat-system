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
exports.UploadedDocumentSchema = exports.UploadedDocument = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UploadedDocument = class UploadedDocument {
    userId;
    originalName;
    mimeType;
    storagePath;
    status;
    chunksCount;
    error;
    processedAt;
    createdAt;
    updatedAt;
};
exports.UploadedDocument = UploadedDocument;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], UploadedDocument.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UploadedDocument.prototype, "originalName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UploadedDocument.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UploadedDocument.prototype, "storagePath", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['processing', 'ready', 'failed'], default: 'processing' }),
    __metadata("design:type", String)
], UploadedDocument.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], UploadedDocument.prototype, "chunksCount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UploadedDocument.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], UploadedDocument.prototype, "processedAt", void 0);
exports.UploadedDocument = UploadedDocument = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'documents' })
], UploadedDocument);
exports.UploadedDocumentSchema = mongoose_1.SchemaFactory.createForClass(UploadedDocument);
//# sourceMappingURL=document.schema.js.map