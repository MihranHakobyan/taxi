import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('HttpException');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        let message: string | string[];
        const exceptionResponse = exception instanceof HttpException 
            ? exception.getResponse() 
            : null;

        if (exceptionResponse && typeof exceptionResponse === 'object') {
            message = (exceptionResponse as any).message || JSON.stringify(exceptionResponse);
        } else {
            message = exception instanceof Error ? exception.message : 'Internal server error';
        }

        this.logger.error(
            `${request.method} ${request.url} ${status} - Error: ${Array.isArray(message) ? message.join(', ') : message}`
        );

        const errorResponse = {
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: Array.isArray(message) ? message[0] : message, 
            ...(process.env.NODE_ENV !== 'production' && {
                stack: exception instanceof Error ? exception.stack : null,
                details: Array.isArray(message) ? message : null,
            }),
        };

        response.status(status).json(errorResponse);
    }
}