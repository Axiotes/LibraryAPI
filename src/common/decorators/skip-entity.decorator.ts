import { CustomDecorator, SetMetadata, Type } from '@nestjs/common';

export const SkipValidated = <T extends object>(
  entity: Type<T>,
): CustomDecorator<string> => SetMetadata('skip_entity', entity);
