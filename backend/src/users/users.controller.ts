import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserQueryDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get("")
  findByUsername(@Query() query: UserQueryDto) {
    return this.userService.findByUsername(query.username);
  }
}
