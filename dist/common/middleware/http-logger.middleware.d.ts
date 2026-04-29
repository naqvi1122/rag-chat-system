import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
type RequestWithUser = Request & {
    user?: {
        id?: string;
        email?: string;
    };
};
export declare class HttpLoggerMiddleware implements NestMiddleware {
    private readonly logger;
    use(req: RequestWithUser, res: Response, next: NextFunction): void;
    private getRequestId;
    private sanitizeBody;
    private sanitize;
    private isSensitiveKey;
}
export {};
