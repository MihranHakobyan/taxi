import {
    ExceptionFilter, Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isHttpException = exception instanceof HttpException;
        const status = isHttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = isHttpException
            ? exception.getResponse()
            : 'Internal server error';

        const message =
            typeof exceptionResponse === 'object'
                ? (exceptionResponse as any).message || JSON.stringify(exceptionResponse)
                : exceptionResponse;

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: Array.isArray(message) ? message : [message],
            ...(process.env.NODE_ENV !== 'production' && {
                stack: exception instanceof Error ? exception.stack : null,
            }),
        };
        response.status(status).json(errorResponse);
    }
}