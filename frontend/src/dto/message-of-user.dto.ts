import { Message } from "./message.dto";

export interface MessageOfUser {
  username: string;
  messages: Message[];
}