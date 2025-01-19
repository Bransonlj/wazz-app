import { Message } from "./message.dto";

export interface UserConversationDto {
  username: string;
  byMessageId: {
    [messageId: string]: Message
  };
}

export interface MessagesByUserResponseDto {
  byUserId: {
    [userId: string]: UserConversationDto;
  };
  undeliveredMessages: Message[];
  unreadMessageIdsByUser: {
    [userId: string]: string[];
  };
}