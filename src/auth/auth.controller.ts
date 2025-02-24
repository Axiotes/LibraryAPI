import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { Auth } from './auth.entity';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  public async create(@Body() body: AuthDto): Promise<{ token: string, authUser: Auth }> {
    return await this.authService.create(body);
  }
}
