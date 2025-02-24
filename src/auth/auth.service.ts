import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository } from 'typeorm';
import { AuthDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepository: Repository<Auth>,
  ) {}

  public async create(authDto: AuthDto): Promise<Auth> {
    const authUserEmail = await this.authRepository.findOne({
      where: { email: authDto.email },
    });

    if (authUserEmail) {
      throw new ConflictException(
        `O e-mail ${authDto.email} já está cadastrado.`,
      );
    }

    const authUser = await this.authRepository.create(authDto);
    return await this.authRepository.save(authUser);
  }
}
