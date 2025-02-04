import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as argon from 'argon2';
import { LoginRequestDto, LoginResponseDto, RegisterDto } from './dto';
import { Types } from 'mongoose';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should throw an error if username already exists', async () => {
      usersService.findByUsername.mockResolvedValue(
        { _id: new Types.ObjectId(), username: 'existingUser', passwordHash: "buh" }
      );

      await expect(authService.signUp({ username: 'existingUser', password: 'password' }))
        .rejects.toThrow(BadRequestException);

      expect(usersService.findByUsername).toHaveBeenCalledWith('existingUser');
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should create a new user with a hashed password', async () => {
      usersService.findByUsername.mockResolvedValue(undefined);
      jest.spyOn(argon, 'hash').mockResolvedValue('hashedPassword');

      const registerDto: RegisterDto = { username: 'newUser', password: 'securePass' };
      await authService.signUp(registerDto);

      expect(usersService.findByUsername).toHaveBeenCalledWith('newUser');
      expect(argon.hash).toHaveBeenCalledWith(registerDto.password);
      expect(usersService.create).toHaveBeenCalledWith({
        username: 'newUser',
        passwordHash: 'hashedPassword',
      });
    });
  });

  describe('signIn', () => {
    it('should throw an error if username does not exist', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(authService.signIn({ username: 'unknownUser', password: 'password' }))
        .rejects.toThrow(ForbiddenException);

      expect(usersService.findByUsername).toHaveBeenCalledWith('unknownUser');
    });

    it('should throw an error if password is incorrect', async () => {
      usersService.findByUsername.mockResolvedValue({ _id: 'user123', username: 'testUser', passwordHash: 'hashedPass' } as any);
      jest.spyOn(argon, 'verify').mockResolvedValue(false);

      await expect(authService.signIn({ username: 'testUser', password: 'wrongPass' }))
        .rejects.toThrow(ForbiddenException);

      expect(argon.verify).toHaveBeenCalledWith('hashedPass', 'wrongPass');
    });

    it('should return a token if login is successful', async () => {
      const user = { _id: 'user123', username: 'validUser', passwordHash: 'hashedPass' };
      usersService.findByUsername.mockResolvedValue(user as any);
      jest.spyOn(argon, 'verify').mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mockedToken');

      const loginDto: LoginRequestDto = { username: 'validUser', password: 'correctPass' };
      const result: LoginResponseDto = await authService.signIn(loginDto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user._id,
        username: user.username,
      });

      expect(result).toEqual({
        access_token: 'mockedToken',
        userId: 'user123',
        username: 'validUser',
      });
    });
  });
});
