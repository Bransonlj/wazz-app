import { Message } from "./message.dto";

export interface UserConversation {
  username: string;
  byMessageId: {
    [messageId: string]: Message
  };
}

export interface MessagesByUserResponseDto {
  byUserId: {
    [userId: string]: UserConversation;
  };
  undeliveredMessages: Message[];
  /*
  unreadMessageIdsByUser: {
    [userId: string]: string[];
  };
  */
}