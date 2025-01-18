import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginRequestDto, LoginResponseDto, RegisterDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, 
    private jwtService: JwtService
  ) {}

  async signUp(registerDto: RegisterDto): Promise<void> {

    const hasUsername = await this.usersService.findByUsername(registerDto.username);
    if (hasUsername) {
      throw new BadRequestException("Username has been taken");
    }

    const hashedPassword = await argon.hash(registerDto.password);

    this.usersService.create({
      username: registerDto.username,
      passwordHash: hashedPassword,
    });
  }

  async signIn(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new ForbiddenException("Username does not exist");
    }

    const isPasswordMatch = await argon.verify(user.passwordHash, loginDto.password);
    if (!isPasswordMatch) {
      throw new ForbiddenException("Invalid password");
    }

    const token = await this.jwtService.signAsync({
      sub: user._id,
      username: user.username, 
    });

    return { access_token: token, userId: user._id.toString(), username: user.username };
  }
}
