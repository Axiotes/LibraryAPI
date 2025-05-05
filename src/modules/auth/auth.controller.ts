import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { UpdateAuthDto } from './dtos/update-auth.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { Auth } from './auth.entity';
import { AuthDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';

import { ApiResponse } from '@lib-common/types/api-respose.type';
import { SkipValidated } from '@lib-common/decorators/skip-entity.decorator';
import { ValidatePaginationInterceptor } from '@lib-common/interceptors/validate-pagination/validate-pagination.interceptor';
import { RoleGuard } from '@lib-common/guards/role/role.guard';
import { Roles } from '@lib-common/decorators/roles.decorator';

@SkipValidated(Auth)
@UseInterceptors(ClassSerializerInterceptor, ValidatePaginationInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar um novo usuário autenticado',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Post('sign-up')
  public async create(
    @Body() body: AuthDto,
  ): Promise<ApiResponse<{ token: string; authUser: Auth }>> {
    const authUser = await this.authService.create(body);

    return {
      data: authUser,
    };
  }

  @ApiOperation({
    summary: 'Realizar login e obter token de autenticação',
    description: 'Qualquer usuário pode realizar essa ação',
  })
  @Post('sign-in')
  public async signIn(
    @Body() body: SignInDto,
  ): Promise<ApiResponse<{ token: string }>> {
    const token = await this.authService.signIn(body);

    return {
      data: token,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar e retornar usuário autenticado com base no ID',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Get(':id')
  public async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Auth>> {
    const auth = await this.authService.findOne(id);

    return {
      data: auth,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar e retornar todos os usuários autenticados',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Get()
  public async find(): Promise<ApiResponse<Auth[]>> {
    const auths = await this.authService.find();

    return {
      data: auths,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar dados de usuário autenticado',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Patch()
  public async update(@Body() body: UpdateAuthDto): Promise<ApiResponse<Auth>> {
    const auth = await this.authService.update(body);

    return {
      data: auth,
    };
  }
}
