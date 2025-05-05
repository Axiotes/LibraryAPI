import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { Logs } from '../../../common/types/logs.type';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements OnModuleInit {
  private readonly logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.File({
        filename: `${__dirname}/../../../../logs/combined.log`,
        level: 'info',
      }),
      new winston.transports.File({
        filename: `${__dirname}/../../../../logs/error.log`,
        level: 'error',
      }),
    ],
  });

  async onModuleInit(): Promise<void> {
    await this.verifyDirectory();
    await this.verifyFiles('./logs/combined.log');
    await this.verifyFiles('./logs/error.log');
  }

  public logInfo(message: Logs): void {
    this.logger.info(message);
  }

  public logError(message: Logs): void {
    this.logger.error(message);
  }

  private async verifyDirectory(): Promise<void> {
    try {
      await fs.access('./logs');
    } catch (error) {
      await fs.mkdir('./logs', { recursive: true });
    }
  }

  private async verifyFiles(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
    } catch (error) {
      await fs.writeFile(filePath, '');
    }
  }
}
