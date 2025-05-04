import { SetMetadata } from '@nestjs/common';

export const SkipValidated = (entity: Function) =>
  SetMetadata('skip_entity', entity);
