"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("./auth/auth.module");
const chat_module_1 = require("./chat/chat.module");
const http_logger_middleware_1 = require("./common/middleware/http-logger.middleware");
const documents_module_1 = require("./documents/documents.module");
const vector_module_1 = require("./vector/vector.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(http_logger_middleware_1.HttpLoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/rag_app'),
            vector_module_1.VectorModule,
            auth_module_1.AuthModule,
            documents_module_1.DocumentsModule,
            chat_module_1.ChatModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map