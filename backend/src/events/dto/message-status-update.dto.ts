import { Status } from "src/messages/schemas";

export class MessageStatusUpdateDto {
  messageId: string;
  newStatus: Status;
  userIdToInform: string;
}