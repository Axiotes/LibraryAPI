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
import { UpdateAuthDto } from './dtos/update-auth.dto';

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
    const authUser = await this.authRepository.findOne({
      where: { email: signInDto.email },
    });

    if (!authUser) {
      throw new UnauthorizedException(`Email ou senha inválido`);
    }

    const passwordMatch = bcrypt.compareSync(
      signInDto.password,
      authUser.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException(`Email ou senha inválido`);
    }

    const token = this.jwtService.sign({
      id: authUser.id,
      role: authUser.role,
    });

    return { token: token };
  }

  public async update(updateAuthDto: UpdateAuthDto) {
    const authUser = await this.authRepository.findOne({
      where: { email: updateAuthDto.email },
    });

    if (!authUser) {
      throw new UnauthorizedException('Email ou senha inválido');
    }

    const passwordMatch = bcrypt.compareSync(
      updateAuthDto.password,
      authUser.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException(`Email ou senha inválido`);
    }

    if (
      updateAuthDto.newEmail &&
      (await this.authRepository.findOne({
        where: { email: updateAuthDto.newEmail },
      }))
    ) {
      throw new ConflictException(
        `O e-mail ${updateAuthDto.email} já está cadastrado.`,
      );
    }

    const updatedAuthUser = await this.authRepository.preload({
      id: authUser.id,
      name: updateAuthDto.name ? updateAuthDto.name : authUser.name,
      email: updateAuthDto.email ? updateAuthDto.newEmail : authUser.email,
      password: updateAuthDto.password
        ? updateAuthDto.newPassword
        : authUser.password,
    });

    return await this.authRepository.save(updatedAuthUser);
  }
}
