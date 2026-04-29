import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

type RequestWithUser = Request & {
  user?: {
    id?: string;
    email?: string;
  };
};

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

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: RequestWithUser, res: Response, next: NextFunction) {
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
      const durationMs =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000;
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
      } else if (res.statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }

  private getRequestId(req: Request) {
    const header = req.get('x-request-id');
    return header?.trim() || randomUUID();
  }

  private sanitizeBody(req: Request) {
    if (req.is('multipart/form-data')) {
      return '[multipart/form-data]';
    }

    return this.sanitize(req.body);
  }

  private sanitize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).reduce(
        (result, [key, item]) => {
          result[key] = this.isSensitiveKey(key)
            ? '[REDACTED]'
            : this.sanitize(item);
          return result;
        },
        {} as Record<string, unknown>,
      );
    }

    return value;
  }

  private isSensitiveKey(key: string) {
    return SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(key.toLowerCase());
  }
}
