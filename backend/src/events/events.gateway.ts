import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "src/messages/messages.service";
import { Message, Status } from "src/messages/schemas";
import { EventResponseDto, MessageRequestDto, MessagesByUserResponseDto, MessageStatusUpdateDto } from "./dto";
import { EventsService } from "./events.service";

interface AuthSocket extends Socket {
  user: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {

  constructor(private messageService: MessagesService, private eventService: EventsService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use((socket: AuthSocket, next) => {
      const username = socket.handshake.auth.username;
      if (!username) {
        return next(new Error("invalid username"));
      }
      socket.user = username;
      next();
    })
  }

  handleConnection(client: AuthSocket, ...args: any[]) {
    const user = client.user
    // authenticate
    client.join(user);
  }

  @SubscribeMessage('get-all')
  async getAllMessages(@ConnectedSocket() client: AuthSocket): Promise<MessagesByUserResponseDto> {
    return this.eventService.getAllMessagesForUser(client.user);
  }

  @SubscribeMessage('message')
  async handleEvent(@MessageBody() data: MessageRequestDto, @ConnectedSocket() client: AuthSocket): Promise<EventResponseDto<string | Message>> {
    try {
      console.log(data);
      const message = await this.eventService.createAndSendMessage(data, this.server);
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
      const updatedMessage = await this.eventService.updateMessageStatus(data, this.server);
      return {
        status: "success",
        data: updatedMessage
      }
    } catch (err) {
      return { status: "error", data: "tuh some error just happened" };
    }
  }
}