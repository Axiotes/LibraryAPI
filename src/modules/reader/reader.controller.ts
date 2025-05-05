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
  UseInterceptors,
} from '@nestjs/common';
import { ReaderService } from './reader.service';
import { ReaderDto } from './dtos/reader.dto';
import { Reader } from './reader.entity';
import { UpdateReaderDto } from './dtos/update-reader.dto';
import { FindReadersDto } from './dtos/find-readers.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@lib-common/guards/role/role.guard';
import { Roles } from '@lib-common/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ValidatePaginationInterceptor } from '@lib-common/interceptors/validate-pagination/validate-pagination.interceptor';
import { SkipValidated } from '@lib-common/decorators/skip-entity.decorator';
import { ApiResponse } from '@lib-common/types/api-respose.type';

@SkipValidated(Reader)
@UseInterceptors(ValidatePaginationInterceptor)
@Controller('reader')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cadastra um novo leitor e retorna leitor criado',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Post()
  public async create(@Body() body: ReaderDto): Promise<ApiResponse<Reader>> {
    const reader = await this.readerService.create(body);

    return {
      data: reader,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca e retorna leitores',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint. Caso deseje utilizar o query param "skip", é necessário utiliza-lo em conjunto com o "limit"',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Get()
  public async findAll(
    @Query() query: FindReadersDto,
  ): Promise<ApiResponse<Reader[]>> {
    const readers = await this.readerService.findAll(query);

    return {
      data: readers,
      pagination: {
        skip: query.skip,
        limit: query.limit,
      },
      total: readers.length,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca e retorna leitor com base no ID',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Get('id/:id')
  public async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Reader>> {
    const reader = await this.readerService.findBy<'id'>('id', id);

    return {
      data: reader,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca e retorna leitor com base no CPF',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Get('cpf/:cpf')
  public async findByCPF(@Param('cpf') cpf: string): Promise<Reader> {
    return this.readerService.findBy<'cpf'>('cpf', cpf);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza os dados do leitor e retorna dados atualizados',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Patch(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReaderDto,
  ): Promise<ApiResponse<Reader>> {
    const reader = await this.readerService.update(id, body);

    return {
      data: reader,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleta cadastro de leitor',
    description:
      'Apenas usuários com token jwt e cargo "admin" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Delete(':id')
  public async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<string>> {
    const deleted = await this.readerService.delete(id);

    return {
      data: deleted.message,
    };
  }
}
