import { Controller } from '@nestjs/common';
import { ReaderService } from './reader.service';

@Controller('api/v1/reader')
export class ReaderController {
    constructor(private readonly readerService: ReaderService) {}
}
