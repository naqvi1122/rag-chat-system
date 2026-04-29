"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('RAG Document Agent API')
        .setDescription('Upload PDF, DOCX, or TXT files, process them into embeddings, and ask document-grounded questions with per-user memory.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, swaggerDocument, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const config = app.get(config_1.ConfigService);
    const port = Number(config.get('PORT', '3000'));
    await app.listen(port);
}
void bootstrap();
//# sourceMappingURL=main.js.map