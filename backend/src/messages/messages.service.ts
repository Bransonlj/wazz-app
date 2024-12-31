import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const createdMessage = new this.messageModel(createMessageDto);
    return createdMessage.save()
  }

  async findByUser(username: string): Promise<Message[]> {
    return this.messageModel.find({
      $or: [
        { from: username },
        { recipient: username }
      ],
    }).sort({
      createdAt: 1 // asc
    });
  }
}
