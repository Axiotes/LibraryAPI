import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { Auth } from './auth.entity';
import { SignInDto } from './dtos/sign-in.dto';
import { Roles } from './decorators/roles.decorator';
import { RoleGuard } from './guards/role/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { UpdateAuthDto } from './dtos/update-auth.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Post('sign-up')
  public async create(
    @Body() body: AuthDto,
  ): Promise<{ token: string; authUser: Auth }> {
    return await this.authService.create(body);
  }

  @Post('sign-in')
  public async signIn(@Body() body: SignInDto) {
    return await this.authService.signIn(body);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Patch()
  public async update(@Body() body: UpdateAuthDto) {
    return await this.authService.update(body)
  }
}
