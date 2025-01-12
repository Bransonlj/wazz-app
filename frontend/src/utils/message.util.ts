import { Message } from "../dto";

export function getOtherUserOfMessage(message: Message, currentUser: string): string {
  return message.recipient === currentUser ? message.sender : message.recipient;
}