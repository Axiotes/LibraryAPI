import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auth])],
})
export class AuthModule {}
