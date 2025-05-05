import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class ValidatePaginationInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const entity = this.reflector.get('skip_entity', context.getClass());
    const request = context.switchToHttp().getRequest();
    const { limit, skip } = request.query;

    if (skip !== undefined && limit === undefined) {
      throw new BadRequestException(
        'O parâmetro "limit" deve ser fornecido quando "skip" for usado.',
      );
    }

    const repository = this.dataSource.getRepository(entity);
    const total = await repository.count();

    if (skip >= total) {
      throw new BadRequestException(
        `Skip ${skip} é maior ou igual o total de registros (${total})`,
      );
    }

    return next.handle();
  }
}
