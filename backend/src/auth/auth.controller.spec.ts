import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginRequestDto, LoginResponseDto, RegisterDto } from './dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get(AuthController);
    authService = module.get(AuthService)
  });

  describe('register', () => {
    it('should call signUp with correct parameters', async () => {
      const registerDto: RegisterDto = { username: 'testUser', password: 'securePass' };
      authService.signUp.mockResolvedValue(undefined);

      await expect(authController.register(registerDto)).resolves.toBeUndefined();

      expect(authService.signUp).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should call signIn with correct parameters and return LoginResponseDto', async () => {
      const loginDto: LoginRequestDto = { username: 'testUser', password: 'securePass' };
      const loginResponse: LoginResponseDto = { access_token: 'mockToken', userId: 'user123', username: 'testUser' };

      authService.signIn.mockResolvedValue(loginResponse);

      await expect(authController.login(loginDto)).resolves.toEqual(loginResponse);

      expect(authService.signIn).toHaveBeenCalledWith(loginDto);
    });
  });
});
