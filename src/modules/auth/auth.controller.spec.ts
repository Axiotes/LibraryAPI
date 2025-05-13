import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth } from './auth.entity';

import { AuthRoleEnum } from '@lib-api/common/enums/auth-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const mockRepo = {
      count: jest.fn().mockResolvedValue(100),
    } as Partial<Repository<Auth>>;

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepo),
    } as Partial<DataSource>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign up a new auth user', async () => {
    const token = 'mocked-valid-token';
    const newAuthDto = {
      name: 'Auth User',
      email: 'authuser@gmail.com',
      password: '123456789',
      role: AuthRoleEnum.EMPLOYEE,
    };

    const auth = new Auth();
    auth.name = newAuthDto.name;
    auth.email = newAuthDto.email;
    auth.password = await bcrypt.hash(newAuthDto.password, 10);
    auth.role = newAuthDto.role;

    service.create = jest.fn().mockResolvedValueOnce({ authUser: auth, token });

    const result = await controller.create(newAuthDto);

    expect(result).toEqual({
      data: {
        authUser: auth,
        token,
      },
    });
  });

  it('should sign in an auth user', async () => {
    const token = 'mocked-valid-token';
    const signInDto = {
      email: 'authuser@gmail.com',
      password: '123456789',
    };

    service.signIn = jest.fn().mockResolvedValueOnce(token);

    const result = await controller.signIn(signInDto);

    expect(result).toEqual({ data: token });
  });

  it('should find one auth user by id', async () => {
    const id = 1;

    const auth = new Auth();
    auth.id = id;

    service.findOne = jest.fn().mockResolvedValueOnce(auth);

    const result = await controller.findOne(id);

    expect(result).toEqual({ data: auth });
  });

  it('should find all auth users', async () => {
    const authUsers = [new Auth(), new Auth()];

    service.find = jest.fn().mockResolvedValueOnce(authUsers);

    const result = await controller.find();

    expect(result).toEqual({ data: authUsers });
  });

  it('should update auth user infos', async () => {
    const dto = {
      email: 'user@example.com',
      password: 'currentPassword',
      newEmail: 'new@example.com',
      newPassword: 'newPassword',
      name: 'New Name',
    };
    const auth = new Auth();
    auth.id = 1;
    auth.email = 'user@example.com';
    auth.password = await bcrypt.hash('hashedPassword', 10);
    auth.name = 'Test User';
    auth.role = AuthRoleEnum.EMPLOYEE;

    const updatedAuth = {
      id: auth.id,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      name: dto.name,
      role: auth.role,
    };

    service.update = jest.fn().mockResolvedValue(updatedAuth);

    const result = await controller.update(dto);
    expect(result).toEqual({ data: updatedAuth });
  });
});
