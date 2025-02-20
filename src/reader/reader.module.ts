import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reader } from './reader.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Reader])]
})
export class ReaderModule {}
