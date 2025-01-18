import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto, LoginResponseDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto): Promise<void> {
    return this.authService.signUp(dto);
  }

  @Post("login")
  login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.signIn(dto)
  }
}
