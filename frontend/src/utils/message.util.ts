import { Message, UserDto } from "../dto";

export function getOtherUserOfMessage(message: Message, currentUser: string): UserDto {
  return message.recipient._id === currentUser ? message.sender : message.recipient;
}