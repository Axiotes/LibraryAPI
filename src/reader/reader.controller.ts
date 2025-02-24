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
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('api/v1/reader')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cadastra um novo leitor e retorna leitor criado',
    description:
      'Apenas usuário com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Post()
  public async create(@Body() body: ReaderDto): Promise<Reader> {
    return await this.readerService.create(body);
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
  public async findAll(@Query() query: FindReadersDto): Promise<Reader[]> {
    return await this.readerService.findAll(query);
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
  ): Promise<Reader> {
    return this.readerService.findBy<'id'>('id', id);
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
  ): Promise<Reader> {
    return await this.readerService.update(id, body);
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
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.readerService.delete(id);
  }
}
