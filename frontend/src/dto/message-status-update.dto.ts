import { MessageStatus } from "../enums";

export interface MessageStatusUpdateDto {
  messageId: string;
  newStatus: MessageStatus;
  userToInform: string;
}