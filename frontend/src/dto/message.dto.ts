import { MessageStatus } from "../enums";
import { UserDto } from "./user.dto";

export interface Message {
  _id: string;
  message: string;
  sender: UserDto; // change to user
  recipient: UserDto;
  status: MessageStatus; 
  // pending status is for client only, when message is yet to be received by server
  // error is for client only, when message was not received by server

  clientId?: string; // for client use only deprecate
  createdAt: string; // in iso date format
}