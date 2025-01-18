import { MessageStatus } from "../enums";

export interface MessageStatusUpdateDto {
  messageId: string;
  newStatus: MessageStatus;
  userIdToInform: string;
}