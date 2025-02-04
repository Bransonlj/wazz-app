import { Injectable } from '@nestjs/common';
import { MessagesService } from 'src/messages/messages.service';
import { MessageRequestDto, MessagesByUserResponseDto, MessageStatusUpdateDto } from './dto';
import { Message, Status } from 'src/messages/schemas';
import { getOtherUserOfMessage } from 'src/utils';

@Injectable()
export class EventsService {
  constructor(private messageService: MessagesService) {}

  async getAllMessagesForUserId(userId: string): Promise<MessagesByUserResponseDto> {
    const messages = await this.messageService.findByUserId(userId);
    const messagesResponse: MessagesByUserResponseDto = { byUserId: {}, undeliveredMessages: [], unreadMessageIdsByUser: {} };

    messages.forEach(message => {
      const otherUser = getOtherUserOfMessage(message, userId); // this is wrong?
      const otherUserIdString = otherUser._id.toString();
      if (!messagesResponse.byUserId[otherUserIdString]) {
        // user not added into Dto yet, add user details
        messagesResponse.byUserId[otherUserIdString] = { username: otherUser.username, byMessageId: {} }; // might need to populate in order to have username param
      } 

      messagesResponse.byUserId[otherUserIdString].byMessageId = {
        ...messagesResponse.byUserId[otherUserIdString].byMessageId,
        [message._id]: message,
      }
      if (message.status === Status.SENT) {
        messagesResponse.undeliveredMessages.push(message);
      }

      if (message.sender === otherUser && (message.status === Status.SENT || message.status === Status.DELIVERED)) {
        if (!messagesResponse.unreadMessageIdsByUser[otherUserIdString]) {
          // other user not added to unread messages yet
          messagesResponse.unreadMessageIdsByUser[otherUserIdString] = [];
        }

        messagesResponse.unreadMessageIdsByUser[otherUserIdString].push(message._id);
      }

    });

    return messagesResponse;
  }

  // update to return the message
  async createAndSendMessage(messageRequest: MessageRequestDto): Promise<Message> {
    return this.messageService.create({
      sender: messageRequest.senderId,
      recipient: messageRequest.recipientId,
      message: messageRequest.message,
    });
  }

  async updateMessageStatus(messageStatusUpdateDto: MessageStatusUpdateDto) {
    return this.messageService.updateStatus(
      messageStatusUpdateDto.messageId, 
      messageStatusUpdateDto.newStatus
    ); 
  }

}
