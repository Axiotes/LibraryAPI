import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReaderService } from './reader.service';
import { ReaderDto } from './dtos/reader.dto';
import { Reader } from './reader.entity';
import { UpdateReaderDto } from './dtos/update-reader.dto';
import { FindReadersDto } from './dtos/find-readers.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/guards/role/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('api/v1/reader')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Post()
  public async create(@Body() body: ReaderDto): Promise<Reader> {
    return await this.readerService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Get()
  public async findAll(@Query() query: FindReadersDto): Promise<Reader[]> {
    return await this.readerService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Get('id/:id')
  public async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Reader> {
    return this.readerService.findBy<'id'>('id', id);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Get('cpf/:cpf')
  public async findByCPF(@Param('cpf') cpf: string): Promise<Reader> {
    return this.readerService.findBy<'cpf'>('cpf', cpf);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Patch(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReaderDto,
  ): Promise<Reader> {
    return await this.readerService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Delete(':id')
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.readerService.delete(id);
  }
}
