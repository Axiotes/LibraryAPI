import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';

import { ErrorInterceptor } from './error.interceptor';

import { LoggerService } from 'src/common/utils/logger/logger.service';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(() => {
    const partialLogger: Partial<jest.Mocked<LoggerService>> = {
      logInfo: jest.fn(),
      logError: jest.fn(),
    };

    loggerService = partialLogger as jest.Mocked<LoggerService>;
    interceptor = new ErrorInterceptor(loggerService);
  });

  const mockContext: ExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        url: '/test',
        params: {},
        body: {},
      }),
      getResponse: () => ({
        statusCode: 500,
      }),
    }),
  } as Partial<ExecutionContext> as ExecutionContext;

  it('should be defined', () => {
    expect(new ErrorInterceptor(loggerService)).toBeDefined();
  });

  it('should not return erros', (done) => {
    const callHandler: CallHandler = {
      handle: () => of('success'),
    };

    interceptor.intercept(mockContext, callHandler).subscribe({
      next: (value) => {
        expect(value).toEqual('success');
        done();
      },
    });
  });

  it('should return error', (done) => {
    const callHandler: CallHandler = {
      handle: () => throwError(() => new Error('error')),
    };

    interceptor.intercept(mockContext, callHandler).subscribe({
      next: () => fail('Should not emit the value'),
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('error');
        done();
      },
    });
  });
});
