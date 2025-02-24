import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository } from 'typeorm';
import { AuthDto } from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dtos/sign-in.dto';
import * as bcrypt from 'bcryptjs';

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

  public async signIn(signInDto: SignInDto) {
    const userUser = await this.authRepository.findOne({
      where: { email: signInDto.email },
    });

    if (!userUser) {
      throw new UnauthorizedException(`Email ou senha inválido`);
    }

    const passwordMatch = bcrypt.compareSync(
      signInDto.password,
      userUser.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException(`Email ou senha inválido`);
    }

    const token = this.jwtService.sign({
      id: userUser.id,
      role: userUser.role,
    });

    return { token: token };
  }
}
