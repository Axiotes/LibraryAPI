import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository } from 'typeorm';
import { AuthDto } from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}

  public async create(
    authDto: AuthDto,
  ): Promise<{ token: string; authUser: Auth }> {
    const authUserEmail = await this.authRepository.findOne({
      where: { email: authDto.email },
    });

    if (authUserEmail) {
      throw new ConflictException(
        `O e-mail ${authDto.email} já está cadastrado.`,
      );
    }

    const authUser = await this.authRepository.create(authDto);
    const savedAuthUser = await this.authRepository.save(authUser);

    const token = this.jwtService.sign({
      id: savedAuthUser.id,
      role: savedAuthUser.role,
    });

    return { token, authUser: savedAuthUser };
  }
}
