import { Test, TestingModule } from '@nestjs/testing';
import { ReaderController } from './reader.controller';

describe('ReaderController', () => {
  let controller: ReaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReaderController],
    }).compile();

    controller = module.get<ReaderController>(ReaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
