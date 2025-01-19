import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, Status } from './schemas';
import { Model, Types } from 'mongoose';
import { CreateMessageDto } from './dto';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      const createdMessage = await this.messageModel.create({
        message: createMessageDto.message,
        recipient: createMessageDto.recipient,
        sender: createMessageDto.sender,
      }).then(message => message.populate(["recipient", "sender"]));
      return createdMessage
    } catch (err) {
      console.log(err)
    }
  }
    
  async findByUserId(userId: string): Promise<Message[]> {
    const userObjectId = new Types.ObjectId(userId)
    return this.messageModel.find({
      $or: [
        { sender: userObjectId },
        { recipient: userObjectId }
      ],
    }).sort({
      createdAt: 1 // asc
    }).populate("sender").populate("recipient");
  }

  async updateStatus(id: string, status: Status): Promise<Message> {
    return this.messageModel.findByIdAndUpdate(id, {
      status,
    }, {
      returnDocument: "after",
    }).populate(["recipient", "sender"]);
  }
}
