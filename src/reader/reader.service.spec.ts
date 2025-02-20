import { Test, TestingModule } from '@nestjs/testing';
import { ReaderService } from './reader.service';

describe('ReaderService', () => {
  let service: ReaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReaderService],
    }).compile();

    service = module.get<ReaderService>(ReaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
