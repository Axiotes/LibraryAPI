import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { of } from 'rxjs';
import { DataSource } from 'typeorm';
import { Reflector } from '@nestjs/core';

import { ValidatePaginationInterceptor } from './validate-pagination.interceptor';

describe('ValidatePaginationInterceptor', () => {
  it('should be defined', () => {
    const mockReflector = {
      get: jest.fn().mockReturnValue('MockEntity'),
    } as Partial<Reflector>;

    const mockRepo = {
      count: jest.fn().mockResolvedValue(100),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    } as Partial<DataSource>;

    expect(
      new ValidatePaginationInterceptor(
        mockReflector as Reflector,
        mockDataSource as DataSource,
      ),
    ).toBeDefined();
  });

  it('should throw BadRequestException if skip is provided without limit', async () => {
    const mockReflector = {
      get: jest.fn().mockReturnValue('MockEntity'),
    } as Partial<Reflector>;

    const mockRepo = {
      count: jest.fn().mockResolvedValue(100),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    } as Partial<DataSource>;

    const interceptor = new ValidatePaginationInterceptor(
      mockReflector as Reflector,
      mockDataSource as DataSource,
    );
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: (): { query: { skip: number; limit: number } } => ({
          query: {
            skip: 10,
            limit: undefined,
          },
        }),
      }),
      getClass: () => class {},
    } as ExecutionContext;

    await expect(() =>
      interceptor.intercept(mockExecutionContext, null),
    ).rejects.toThrow(BadRequestException);
  });

  it('should not throw an exception if both skip and limit are provided', async () => {
    const mockReflector = {
      get: jest.fn().mockReturnValue('MockEntity'),
    } as Partial<Reflector>;

    const mockRepo = {
      count: jest.fn().mockResolvedValue(100),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    } as Partial<DataSource>;

    const interceptor = new ValidatePaginationInterceptor(
      mockReflector as Reflector,
      mockDataSource as DataSource,
    );
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: (): { query: { skip: number; limit: number } } => ({
          query: {
            skip: 10,
            limit: 5,
          },
        }),
      }),
      getClass: () => class {},
    } as ExecutionContext;

    const callHandler: CallHandler = {
      handle: () => of(),
    };
    const observable = await interceptor.intercept(
      mockExecutionContext,
      callHandler,
    );
    observable.subscribe((value) => {
      expect(value).toBeUndefined();
    });
  });

  it('should not throw an exception if only limit is provided', async () => {
    const mockReflector = {
      get: jest.fn().mockReturnValue('MockEntity'),
    } as Partial<Reflector>;

    const mockRepo = {
      count: jest.fn().mockResolvedValue(100),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    } as Partial<DataSource>;

    const interceptor = new ValidatePaginationInterceptor(
      mockReflector as Reflector,
      mockDataSource as DataSource,
    );
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: (): { query: { skip: number; limit: number } } => ({
          query: {
            skip: undefined,
            limit: 10,
          },
        }),
      }),
      getClass: () => class {},
    } as ExecutionContext;

    const callHandler: CallHandler = {
      handle: () => of(),
    };
    const observable = await interceptor.intercept(
      mockExecutionContext,
      callHandler,
    );
    observable.subscribe((value) => {
      expect(value).toBeUndefined();
    });
  });

  it('should not throw an exception if neither skip nor limit are provided', async () => {
    const mockReflector = {
      get: jest.fn().mockReturnValue('MockEntity'),
    } as Partial<Reflector>;

    const mockRepo = {
      count: jest.fn().mockResolvedValue(100),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    } as Partial<DataSource>;

    const interceptor = new ValidatePaginationInterceptor(
      mockReflector as Reflector,
      mockDataSource as DataSource,
    );
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: (): { query: { skip: number; limit: number } } => ({
          query: {
            skip: undefined,
            limit: undefined,
          },
        }),
      }),
      getClass: () => class {},
    } as ExecutionContext;

    const callHandler: CallHandler = {
      handle: () => of(),
    };
    const observable = await interceptor.intercept(
      mockExecutionContext,
      callHandler,
    );

    observable.subscribe((value) => {
      expect(value).toBeUndefined();
    });
  });

  it('should throw BadRequestException if skip exceeds total records', async () => {
    const mockReflector = {
      get: jest.fn().mockReturnValue('MockEntity'),
    } as Partial<Reflector>;

    const mockRepo = {
      count: jest.fn().mockResolvedValue(15),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    } as Partial<DataSource>;

    const interceptor = new ValidatePaginationInterceptor(
      mockReflector as Reflector,
      mockDataSource as DataSource,
    );

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: (): { query: { skip: number; limit: number } } => ({
          query: {
            skip: 20,
            limit: 5,
          },
        }),
      }),
      getClass: () => class {},
    } as ExecutionContext;

    const callHandler: CallHandler = {
      handle: () => of(),
    };

    await expect(() =>
      interceptor.intercept(mockExecutionContext, callHandler),
    ).rejects.toThrow(BadRequestException);
  });
});
