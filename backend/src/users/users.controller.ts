import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { UserQueryDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get("")
  findByUsername(@Query() query: UserQueryDto) {
    return this.userService.findByUsername(query.username);
  }

  @Get(":id")
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} does not exist`);
    }

    return user;
  }
}
