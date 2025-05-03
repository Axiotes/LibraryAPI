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
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { Auth } from './auth.entity';
import { SignInDto } from './dtos/sign-in.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleGuard } from '../../common/guards/role/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { UpdateAuthDto } from './dtos/update-auth.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/v1/auth')
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
  ): Promise<{ token: string; authUser: Auth }> {
    return await this.authService.create(body);
  }

  @ApiOperation({
    summary: 'Realizar login e obter token de autenticação',
    description: 'Qualquer usuário pode realizar essa ação',
  })
  @Post('sign-in')
  public async signIn(@Body() body: SignInDto): Promise<{ token: string }> {
    return await this.authService.signIn(body);
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
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<Auth> {
    return await this.authService.findOne(id);
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
  public async find(): Promise<Auth[]> {
    return await this.authService.find();
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
  public async update(@Body() body: UpdateAuthDto): Promise<Auth> {
    return await this.authService.update(body);
  }
}
