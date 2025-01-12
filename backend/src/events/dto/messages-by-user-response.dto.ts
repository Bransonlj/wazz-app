import { Message } from "src/messages/schemas";

export class UserConversation {
  username: string;
  byMessageId: {
    [messageId: string]: Message
  };
}

export class MessagesByUserResponseDto {
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