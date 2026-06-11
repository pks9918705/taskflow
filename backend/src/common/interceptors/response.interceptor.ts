import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    return next.handle().pipe(
      map((response) => {
        if (this.isPaginated(response)) {
          return {
            success: true,
            data: response.data,
            meta: response.meta,
          };
        }
        return {
          success: true,
          data: response,
        };
      }),
    );
  }

  private isPaginated(response: unknown): response is PaginatedResponse<unknown> {
    return (
      typeof response === 'object' &&
      response !== null &&
      'data' in response &&
      'meta' in response &&
      Array.isArray((response as PaginatedResponse<unknown>).data)
    );
  }
}
