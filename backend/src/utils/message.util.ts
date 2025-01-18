import { Message } from "src/messages/schemas";
import { User } from "src/users/schemas/user.schema";

export function getOtherUserOfMessage(message: Message, userId: string): User {
  return message.recipient._id.toString() === userId ? message.sender : message.recipient;
}