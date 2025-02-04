import { Message, SafeUser } from "src/messages/schemas";

export function getOtherUserOfMessage(message: Message, userId: string): SafeUser {
  return message.recipient._id.toString() === userId ? message.sender : message.recipient;
}