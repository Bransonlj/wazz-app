import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from "mongoose";
import { MessagesService } from "./messages.service";
import { Message, Status } from "./schemas";
import { getModelToken } from '@nestjs/mongoose';
import { CreateMessageDto } from './dto';

describe('MessagesService', () => {
  let service: MessagesService;
  let model: jest.Mocked<Model<Message>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getModelToken(Message.name),
          useValue: {
            // put mock functions here to ensure it is reset between tests
            create: jest.fn(),
            find: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get(MessagesService);
    model = module.get(getModelToken(Message.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a message', async () => {
      const sender = { _id: new Types.ObjectId(), name: 'Sender User' }
      const recipient = { _id: new Types.ObjectId(), name: 'Recipient User' }
      const createMessageDto: CreateMessageDto = {
        message: 'Hello, World!',
        recipient: recipient._id.toHexString(),
        sender: sender._id.toHexString(),
      };

      const mockMessage = {
        _id: new Types.ObjectId(),
        message: createMessageDto.message,
        sender,
        recipient,
      }

      const mockResponse = {
        populate: jest.fn().mockResolvedValue(mockMessage),
      };

      model.create.mockResolvedValue(mockResponse as any);

      const result = await service.create(createMessageDto);
      expect(result).toEqual(mockMessage);
      expect(model.create).toHaveBeenCalledWith({
        message: createMessageDto.message,
        recipient: createMessageDto.recipient,
        sender: createMessageDto.sender,
      });

      expect(mockResponse.populate).toHaveBeenCalledWith(['recipient', 'sender']);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('findByUserId', () => {
    it('should return messages for a given user', async () => {
      const userId = new Types.ObjectId().toString();

      const messages = [
        {
          _id: new Types.ObjectId().toString(),
          message: 'Test message',
          sender: { _id: userId, name: 'Sender User' },
          recipient: { _id: new Types.ObjectId().toString(), name: 'Recipient User' },
          createdAt: new Date(),
        },
      ];

      const queryMock = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(messages),
      };

      (model.find as jest.Mock).mockReturnValue(queryMock);

      const result = await service.findByUserId(userId);

      expect(model.find).toHaveBeenCalledWith({
        $or: [{ sender: new Types.ObjectId(userId) }, { recipient: new Types.ObjectId(userId) }],
      });
      expect(queryMock.sort).toHaveBeenCalledWith({ createdAt: 1 });
      expect(queryMock.populate).toHaveBeenCalledWith([
        { path: 'recipient', select: "-passwordHash" }, 
        { path: 'sender', select: "-passwordHash" }
      ]);
      expect(result).toEqual(messages);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a message and return it with populated fields', async () => {
      const messageId = new Types.ObjectId().toString();

      const mockMessage = {
        _id: messageId,
        message: 'Updated message',
        sender: { _id: new Types.ObjectId().toString(), name: 'Sender User' },
        recipient: { _id: new Types.ObjectId().toString(), name: 'Recipient User' },
        status: Status.DELIVERED,
      }

      const updatedMessage = {
        populate: jest.fn().mockResolvedValue(mockMessage),
      };

      model.findByIdAndUpdate.mockResolvedValue(updatedMessage);

      const result = await service.updateStatus(messageId, Status.DELIVERED);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        messageId,
        { status: Status.DELIVERED },
        { returnDocument: 'after' },
      );

      expect(updatedMessage.populate).toHaveBeenCalledWith(['recipient', 'sender']);
      expect(result).toEqual(mockMessage);
    });
  });
})
