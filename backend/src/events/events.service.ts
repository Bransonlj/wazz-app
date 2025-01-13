import { Injectable } from '@nestjs/common';
import { MessagesService } from 'src/messages/messages.service';
import { MessageRequestDto, MessagesByUserResponseDto, MessageStatusUpdateDto } from './dto';
import { Server } from 'socket.io';
import { Message, Status } from 'src/messages/schemas';
import { getOtherUserOfMessage } from 'src/utils';

@Injectable()
export class EventsService {
  constructor(private messageService: MessagesService) {}

  async getAllMessagesForUser(user: string): Promise<MessagesByUserResponseDto> {
    const messages = await this.messageService.findByUser(user);
    const messagesResponse: MessagesByUserResponseDto = { byUserId: {}, undeliveredMessages: [], unreadMessageIdsByUser: {} };
    messages.forEach(message => {
      const otherUser = getOtherUserOfMessage(message, user);
      if (!messagesResponse.byUserId[otherUser]) {
        // user not added into Dto yet, add user details
        messagesResponse.byUserId[otherUser] = { username: otherUser, byMessageId: {} };
      } 

      messagesResponse.byUserId[otherUser].byMessageId = {
        ...messagesResponse.byUserId[otherUser].byMessageId,
        [message._id]: message,
      }
      if (message.status === Status.SENT) {
        messagesResponse.undeliveredMessages.push(message);
      }

      if (message.status === Status.SENT || message.status === Status.DELIVERED && message.sender === otherUser) {
        if (!messagesResponse.unreadMessageIdsByUser[otherUser]) {
          // other user not added to unread messages yet
          messagesResponse.unreadMessageIdsByUser[otherUser] = [];
        }

        messagesResponse.unreadMessageIdsByUser[otherUser].push(message._id);
      }

    });

    return messagesResponse;
  }

  async createAndSendMessage(messageRequest: MessageRequestDto, server: Server): Promise<Message> {
    const message = await this.messageService.create({
      sender: messageRequest.sender,
      recipient: messageRequest.recipient,
      message: messageRequest.message,
    });

    server.to(messageRequest.recipient).emit("message", message);

    return message;
  }

  async updateMessageStatus(messageStatusUpdateDto: MessageStatusUpdateDto, server: Server) {
    const updatedMessage = await this.messageService.updateStatus(
      messageStatusUpdateDto.messageId, 
      messageStatusUpdateDto.newStatus
    ); 

    server.to(messageStatusUpdateDto.userToInform).emit("message-status-update", updatedMessage);
    return updatedMessage;
  }

}
