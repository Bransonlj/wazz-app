import { Types } from "mongoose";
import { MessagesService } from "src/messages/messages.service";
import { Message, Status } from "src/messages/schemas";
import { EventsService } from "./events.service";
import { Test, TestingModule } from "@nestjs/testing";
import { MessageRequestDto, MessagesByUserResponseDto, MessageStatusUpdateDto } from "./dto";
import { CreateMessageDto } from "src/messages/dto";

describe('EventService', () => {
  let eventsService: EventsService;
  let messagesService: jest.Mocked<MessagesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: MessagesService,
          useValue: {
            findByUserId: jest.fn(),
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        }
      ],
    }).compile();

    eventsService = module.get(EventsService);
    messagesService = module.get(MessagesService);
  });

  it('should be defined', () => {
    expect(eventsService).toBeDefined();
  });
  
  describe('getAllMessagesForUserId', () => {
    it('should return formatted messages for a user', async () => {
      const user1 = { _id: new Types.ObjectId(), username: 'User1' }; // search user
      const user2 = { _id: new Types.ObjectId(), username: 'User2' };
      const user3 = { _id: new Types.ObjectId(), username: 'User3' };

      const messages: Message[] = [
        {
          _id: new Types.ObjectId().toString(),
          message: 'Hello from 1',
          sender: user1,
          recipient: user2,
          status: Status.SENT,
          createdAt: new Date(),
        },
        {
          _id: new Types.ObjectId().toString(),
          message: 'Hello to 1',
          sender: user3,
          recipient: user1,
          status: Status.DELIVERED,
          createdAt: new Date(),
        },
      ];

      const expectedResponse: MessagesByUserResponseDto = {
        byUserId: {
          [user2._id.toHexString()]: {
            username: user2.username,
            byMessageId: {
              [messages[0]._id]: messages[0],
            }
          },
          [user3._id.toHexString()]: {
            username: user3.username,
            byMessageId: {
              [messages[1]._id]: messages[1],
            }
          }
        },
        undeliveredMessages: [messages[0]],
        unreadMessageIdsByUser: {
          [user3._id.toHexString()]: [messages[1]._id],
        }
      };

      messagesService.findByUserId.mockResolvedValue(messages);
      // (getOtherUserOfMessage as jest.Mock).mockReturnValue(message.recipient); // mock util?

      const response = await eventsService.getAllMessagesForUserId(user1._id.toHexString());
      expect(messagesService.findByUserId).toHaveBeenCalledWith(user1._id.toHexString());
      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe('createAndSendMessage', () => {
    it('should create and send a message via WebSocket', async () => {
      const messageRequest: MessageRequestDto = {
        senderId: new Types.ObjectId().toString(),
        recipientId: new Types.ObjectId().toString(),
        message: 'Test message',
      };

      const createMessageDto: CreateMessageDto = {
        recipient: messageRequest.recipientId,
        sender: messageRequest.senderId,
        message: messageRequest.message,
      }

      const createdMessage: Message = {
        _id: new Types.ObjectId().toString(),
        message: 'Hello from 1',
        sender: { _id: new Types.ObjectId(), username: 'User1' },
        recipient: { _id: new Types.ObjectId(), username: 'User2' },
        status: Status.SENT,
        createdAt: new Date(),
      }
      messagesService.create.mockResolvedValue(createdMessage);

      const result = await eventsService.createAndSendMessage(messageRequest);
      expect(result).toEqual(createdMessage);
      expect(messagesService.create).toHaveBeenCalledWith(createMessageDto);
    });
  });

  describe('updateMessageStatus', () => {
    it('should update the message status and notify via WebSocket', async () => {
      const messageStatusUpdate: MessageStatusUpdateDto = {
        messageId: new Types.ObjectId().toString(),
        newStatus: Status.READ,
        userIdToInform: new Types.ObjectId().toString(),
      };

      const updatedMessage: Message = {
        _id: new Types.ObjectId().toString(),
        message: 'Hello from 1',
        sender: { _id: new Types.ObjectId(), username: 'User1' },
        recipient: { _id: new Types.ObjectId(), username: 'User2' },
        status: Status.READ,
        createdAt: new Date(),
      }
      messagesService.updateStatus.mockResolvedValue(updatedMessage);

      const result = await eventsService.updateMessageStatus(messageStatusUpdate);
      expect(result).toEqual(updatedMessage);
      expect(messagesService.updateStatus).toHaveBeenCalledWith(
        messageStatusUpdate.messageId,
        messageStatusUpdate.newStatus,
      );
    });
  });

});