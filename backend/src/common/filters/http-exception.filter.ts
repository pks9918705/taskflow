import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

const ERROR_CODE_MAP: Record<string, string> = {
  BadRequestException: 'BAD_REQUEST',
  UnauthorizedException: 'UNAUTHORIZED',
  ForbiddenException: 'FORBIDDEN',
  NotFoundException: 'NOT_FOUND',
  ConflictException: 'CONFLICT',
  UnprocessableEntityException: 'UNPROCESSABLE_ENTITY',
  InternalServerErrorException: 'INTERNAL_SERVER_ERROR',
  NotImplementedException: 'NOT_IMPLEMENTED',
  ServiceUnavailableException: 'SERVICE_UNAVAILABLE',
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const _request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorCode =
      ERROR_CODE_MAP[exception.constructor.name] ||
      HttpStatus[status] ||
      'UNKNOWN_ERROR';

    let message: string = exception.message;
    let details: Record<string, unknown> | undefined;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      if (typeof resp['message'] === 'string') {
        message = resp['message'];
      } else if (Array.isArray(resp['message'])) {
        message = 'Validation failed';
        details = { errors: resp['message'] };
      }
    }

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details ? { details } : {}),
      },
    });
  }
}
