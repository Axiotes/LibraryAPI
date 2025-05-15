import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { Auth } from './auth.entity';
import { AuthService } from './auth.service';
import { UpdateAuthDto } from './dtos/update-auth.dto';

import { AuthRoleEnum } from '@lib-api/common/enums/auth-role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let authRepositoryMock: Partial<jest.Mocked<Repository<Auth>>>;
  let jwtService: JwtService;

  beforeEach(async () => {
    authRepositoryMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        { provide: getRepositoryToken(Auth), useValue: authRepositoryMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an auth user successfuly', async () => {
    const token = 'mocked-jwt-token';
    const authUser = {
      id: 1,
      name: 'Mocked Auth User',
      email: 'authuser@gmail.com',
      password: '123456789',
      role: AuthRoleEnum.EMPLOYEE,
    };

    const auth = new Auth();
    auth.id = authUser.id;
    auth.name = authUser.name;
    auth.email = authUser.email;
    auth.password = authUser.password;
    auth.role = authUser.role;

    authRepositoryMock.findOne.mockResolvedValueOnce(null);
    authRepositoryMock.create.mockReturnValueOnce(auth);
    authRepositoryMock.save.mockResolvedValueOnce(auth);
    jwtService.sign = jest.fn().mockReturnValueOnce(token);

    const result = await service.create(authUser);

    expect(authRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { email: authUser.email },
    });
    expect(authRepositoryMock.create).toHaveBeenCalledWith(authUser);
    expect(authRepositoryMock.save).toHaveBeenCalledWith(auth);
    expect(jwtService.sign).toHaveBeenCalledWith({
      id: auth.id,
      role: auth.role,
    });
    expect(result).toEqual({ token, authUser: auth });
  });

  it('should throw a ConflictException if email already registred', async () => {
    const authUser = {
      id: 1,
      name: 'Mocked Auth User',
      email: 'authuser@gmail.com',
      password: '123456789',
      role: AuthRoleEnum.EMPLOYEE,
    };

    const auth = new Auth();
    auth.name = authUser.name;

    authRepositoryMock.findOne.mockResolvedValueOnce(auth);
    jwtService.sign = jest.fn();

    await expect(service.create(authUser)).rejects.toThrow(
      new ConflictException(`O e-mail ${authUser.email} já está cadastrado.`),
    );
    expect(authRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(authRepositoryMock.save).toHaveBeenCalledTimes(0);
    expect(jwtService.sign).toHaveBeenCalledTimes(0);
  });

  it('should a auth user sign in successfuly', async () => {
    const token = 'mocked-jwt-token';
    const signInDto = {
      email: 'authuser@gmail.com',
      password: '123456789',
    };

    const auth = new Auth();
    auth.email = signInDto.email;
    auth.password = bcrypt.hashSync(signInDto.password, 10);

    authRepositoryMock.findOne.mockResolvedValueOnce(auth);
    const passwordMatch = bcrypt.compareSync(signInDto.password, auth.password);
    jwtService.sign = jest.fn().mockReturnValueOnce(token);

    const result = await service.signIn(signInDto);

    expect(authRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { email: signInDto.email },
    });
    expect(passwordMatch).toEqual(true);
    expect(jwtService.sign).toHaveBeenCalledWith({
      id: auth.id,
      role: auth.role,
    });
    expect(result).toEqual({ token });
  });

  it('should throw an UnauthorizedException if email not found', async () => {
    const signInDto = {
      email: 'authuser@gmail.com',
      password: '123456789',
    };

    authRepositoryMock.findOne.mockResolvedValueOnce(null);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
    jwtService.sign = jest.fn();

    await expect(service.signIn(signInDto)).rejects.toThrow(
      new UnauthorizedException(`Email ou senha inválido`),
    );
    expect(bcrypt.compareSync).toHaveBeenCalledTimes(0);
    expect(jwtService.sign).toHaveBeenCalledTimes(0);
  });

  it('should throw an UnauthorizedException if password is invalid', async () => {
    const signInDto = {
      email: 'authuser@gmail.com',
      password: '123456789',
    };

    const auth = new Auth();
    auth.email = signInDto.email;
    auth.password = bcrypt.hashSync('987654321', 10);

    authRepositoryMock.findOne.mockResolvedValueOnce(auth);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
    jwtService.sign = jest.fn();

    await expect(service.signIn(signInDto)).rejects.toThrow(
      new UnauthorizedException(`Email ou senha inválido`),
    );
    expect(bcrypt.compareSync).toHaveBeenCalledTimes(1);
    expect(jwtService.sign).toHaveBeenCalledTimes(0);
  });

  it('should find one auth user by id', async () => {
    const id = 1;
    const auth = new Auth();
    auth.id = id;

    authRepositoryMock.findOne.mockResolvedValueOnce(auth);

    const result = await service.findOne(id);

    expect(result).toEqual(auth);
  });

  it('should find all auth users', async () => {
    const authUsers = [new Auth(), new Auth()];

    authRepositoryMock.find.mockResolvedValueOnce(authUsers);

    const result = await service.find();

    expect(result).toEqual(authUsers);
  });

  it('should throw UnauthorizedException if email does not exist', async () => {
    const dto: UpdateAuthDto = {
      email: 'no@exist.com',
      password: 'random',
      name: undefined,
      newEmail: undefined,
      newPassword: undefined,
    };

    authRepositoryMock.findOne!.mockResolvedValueOnce(null);

    await expect(service.update(dto)).rejects.toThrow(
      new UnauthorizedException('Email ou senha inválido'),
    );

    expect(authRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(authRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { email: dto.email },
    });
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    const auth = new Auth();
    auth.email = 'user@test.com';
    auth.password = bcrypt.hashSync('correct-pass', 10);

    const dto: UpdateAuthDto = {
      email: auth.email,
      password: 'wrong-pass',
      name: undefined,
      newEmail: undefined,
      newPassword: undefined,
    };

    authRepositoryMock.findOne!.mockResolvedValueOnce(auth);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

    await expect(service.update(dto)).rejects.toThrow(
      new UnauthorizedException('Email ou senha inválido'),
    );

    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      dto.password,
      auth.password,
    );
  });

  it('should throw ConflictException if newEmail is already registered', async () => {
    const auth = new Auth();
    auth.id = 1;
    auth.email = 'user@test.com';
    auth.password = bcrypt.hashSync('1234', 10);

    const dto: UpdateAuthDto = {
      email: auth.email,
      password: '1234',
      newEmail: 'already@used.com',
      name: undefined,
      newPassword: undefined,
    };

    authRepositoryMock
      .findOne!.mockResolvedValueOnce(auth)
      .mockResolvedValueOnce({ id: 2 } as Auth);

    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    await expect(service.update(dto)).rejects.toThrow(
      new ConflictException(`O e-mail ${dto.email} já está cadastrado.`),
    );

    expect(authRepositoryMock.findOne).toHaveBeenCalledTimes(2);
    expect(authRepositoryMock.findOne).toHaveBeenNthCalledWith(2, {
      where: { email: dto.newEmail },
    });
  });

  it('should update only the name when provided', async () => {
    const auth = new Auth();
    auth.id = 1;
    auth.name = 'Old Name';
    auth.email = 'user@test.com';
    auth.password = bcrypt.hashSync('1234', 10);

    const dto: UpdateAuthDto = {
      email: auth.email,
      password: '1234',
      name: 'New Name',
      newEmail: undefined,
      newPassword: undefined,
    };

    authRepositoryMock.findOne!.mockResolvedValueOnce(auth);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    const preloaded = { ...auth, name: dto.name };
    authRepositoryMock.preload!.mockResolvedValueOnce(preloaded as Auth);
    authRepositoryMock.save!.mockResolvedValueOnce(preloaded as Auth);

    const result = await service.update(dto);

    expect(authRepositoryMock.preload).toHaveBeenCalledWith({
      id: auth.id,
      name: dto.name,
      email: undefined,
      password: undefined,
    });
    expect(authRepositoryMock.save).toHaveBeenCalledWith(preloaded);
    expect(result.name).toBe('New Name');
    expect(result.email).toBe(auth.email);
  });

  it('should update email and password when provided', async () => {
    const auth = new Auth();
    auth.id = 1;
    auth.name = 'Name';
    auth.email = 'user@test.com';
    auth.password = bcrypt.hashSync('1234', 10);

    const dto: UpdateAuthDto = {
      email: auth.email,
      password: '1234',
      newEmail: 'new@test.com',
      newPassword: 'abcd',
      name: undefined,
    };

    authRepositoryMock
      .findOne!.mockResolvedValueOnce(auth)
      .mockResolvedValueOnce(null);

    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    const preloaded = {
      id: auth.id,
      name: auth.name,
      email: dto.newEmail,
      password: dto.newPassword,
    } as Auth;
    authRepositoryMock.preload!.mockResolvedValueOnce(preloaded);
    authRepositoryMock.save!.mockResolvedValueOnce(preloaded);

    const result = await service.update(dto);

    expect(authRepositoryMock.preload).toHaveBeenCalledWith({
      id: auth.id,
      name: auth.name,
      email: dto.newEmail,
      password: dto.newPassword,
    });
    expect(result.email).toBe(dto.newEmail);
    expect(result.password).toBe(dto.newPassword);
  });
});
