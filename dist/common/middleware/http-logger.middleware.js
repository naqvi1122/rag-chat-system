"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const SENSITIVE_KEYS = new Set([
    'authorization',
    'accessToken',
    'access_token',
    'apiKey',
    'api_key',
    'cookie',
    'jwt',
    'password',
    'refreshToken',
    'refresh_token',
    'secret',
    'token',
]);
let HttpLoggerMiddleware = class HttpLoggerMiddleware {
    logger = new common_1.Logger('HTTP');
    use(req, res, next) {
        const requestId = this.getRequestId(req);
        const startedAt = process.hrtime.bigint();
        res.setHeader('x-request-id', requestId);
        const requestLog = {
            requestId,
            method: req.method,
            path: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            query: this.sanitize(req.query),
            params: this.sanitize(req.params),
            body: this.sanitizeBody(req),
        };
        this.logger.log(`Incoming request ${JSON.stringify(requestLog)}`);
        res.on('finish', () => {
            const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
            const responseLog = {
                requestId,
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                durationMs: Number(durationMs.toFixed(2)),
                contentLength: res.getHeader('content-length') ?? null,
                userId: req.user?.id ?? null,
                userEmail: req.user?.email ?? null,
            };
            const message = `Completed request ${JSON.stringify(responseLog)}`;
            if (res.statusCode >= 500) {
                this.logger.error(message);
            }
            else if (res.statusCode >= 400) {
                this.logger.warn(message);
            }
            else {
                this.logger.log(message);
            }
        });
        next();
    }
    getRequestId(req) {
        const header = req.get('x-request-id');
        return header?.trim() || (0, crypto_1.randomUUID)();
    }
    sanitizeBody(req) {
        if (req.is('multipart/form-data')) {
            return '[multipart/form-data]';
        }
        return this.sanitize(req.body);
    }
    sanitize(value) {
        if (Array.isArray(value)) {
            return value.map((item) => this.sanitize(item));
        }
        if (value && typeof value === 'object') {
            return Object.entries(value).reduce((result, [key, item]) => {
                result[key] = this.isSensitiveKey(key)
                    ? '[REDACTED]'
                    : this.sanitize(item);
                return result;
            }, {});
        }
        return value;
    }
    isSensitiveKey(key) {
        return SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(key.toLowerCase());
    }
};
exports.HttpLoggerMiddleware = HttpLoggerMiddleware;
exports.HttpLoggerMiddleware = HttpLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], HttpLoggerMiddleware);
//# sourceMappingURL=http-logger.middleware.js.map