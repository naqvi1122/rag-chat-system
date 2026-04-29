"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const multer_1 = require("multer");
const path_1 = require("path");
const crypto_1 = require("crypto");
const documents_controller_1 = require("./documents.controller");
const documents_service_1 = require("./documents.service");
const document_schema_1 = require("./schemas/document.schema");
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: document_schema_1.UploadedDocument.name, schema: document_schema_1.UploadedDocumentSchema },
            ]),
            platform_express_1.MulterModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    dest: config.get('UPLOAD_DIR', 'uploads'),
                    limits: {
                        fileSize: Number(config.get('MAX_UPLOAD_MB', '20')) * 1024 * 1024,
                    },
                    storage: (0, multer_1.diskStorage)({
                        destination: config.get('UPLOAD_DIR', 'uploads'),
                        filename: (_req, file, callback) => {
                            callback(null, `${(0, crypto_1.randomUUID)()}${(0, path_1.extname)(file.originalname)}`);
                        },
                    }),
                }),
            }),
        ],
        controllers: [documents_controller_1.DocumentsController],
        providers: [documents_service_1.DocumentsService],
        exports: [documents_service_1.DocumentsService],
    })
], DocumentsModule);
//# sourceMappingURL=documents.module.js.map