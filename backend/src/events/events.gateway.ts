import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "src/messages/messages.service";
import { Message, Status } from "src/messages/schemas";
import { EventResponseDto, MessageRequestDto, MessagesByUserResponseDto, MessageStatusUpdateDto } from "./dto";
import { EventsService } from "./events.service";

interface AuthSocket extends Socket {
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private eventService: EventsService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use((socket: AuthSocket, next) => {
      const userId = socket.handshake.auth.userId || socket.handshake.headers.userid;
      if (!userId) {
        // i can check userService and also retrieve username if needed
        return next(new Error("invalid userId"));
      }
      socket.userId = userId;
      next();
    })
  }

  handleConnection(client: AuthSocket, ...args: any[]) {
    const userId = client.userId
    console.log("user connected", userId);
    // authenticate
    client.join(userId);
  }

  handleDisconnect(client: AuthSocket) {
      console.log("user disconnected", client.userId)
  }

  @SubscribeMessage('get-all')
  async getAllMessages(@ConnectedSocket() client: AuthSocket): Promise<MessagesByUserResponseDto> {
    return this.eventService.getAllMessagesForUserId(client.userId);
  }

  @SubscribeMessage('message')
  async handleEvent(@MessageBody() data: MessageRequestDto, @ConnectedSocket() client: AuthSocket): Promise<EventResponseDto<string | Message>> {
    // verify clientId match
    try {
      const message = await this.eventService.createAndSendMessage(data);
      this.server.to(data.recipientId).emit("message", message);
      return {
        status: "success",
        data: message,
      }
    } catch (err) {
      return { status: "error", data: "tuh some error just happened" };
    }
  }

  @SubscribeMessage('message-status-update') 
  async handleMessageStatusUpdate(@MessageBody() data: MessageStatusUpdateDto): Promise<EventResponseDto<string | Message>> {
    try {
      const updatedMessage = await this.eventService.updateMessageStatus(data);
      this.server.to(data.userIdToInform).emit("message-status-update", updatedMessage);
      return {
        status: "success",
        data: updatedMessage
      }
    } catch (err) {
      return { status: "error", data: "tuh some error just happened" };
    }
  }
}