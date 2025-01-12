import { Message } from "src/messages/schemas";

export function getOtherUserOfMessage(message: Message, user: string) {
  return message.recipient === user ? message.sender : message.recipient;
}