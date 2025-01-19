import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username });
  }

  async findById(id: string): Promise<User | undefined> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid user id");
    }
    return this.userModel.findById(id);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }
}
