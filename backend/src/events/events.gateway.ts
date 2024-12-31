import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsGuard } from "src/auth/ws.guard";
import { MessagesService } from "src/messages/messages.service";
import { Message } from "src/messages/schemas";

interface AuthSocket extends Socket {
  user: string;
}

interface MessageRequest {
  recipient: string;
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {

  constructor(private messageService: MessagesService) {}

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
    client.join(user);
  }

  @SubscribeMessage('get-all')
  async getAllMessages(@ConnectedSocket() client: AuthSocket): Promise<{ username: string, messages: Message[] }[]> {
    const messages = await this.messageService.findByUser(client.user);
    const messagesPerUser = new Map<string, Message[]>();
    messages.forEach(message => {
      const otherUser = client.user === message.from ? message.recipient : message.from;
      if (messagesPerUser.has(otherUser)) {
        messagesPerUser.get(otherUser).push(message);
      } else {
        messagesPerUser.set(otherUser, [message]);
      }
    });

    const users = [];
    messagesPerUser.forEach((messages, username) => {
      users.push({
        username,
        messages,
      });
    });

    return users;
  }

  @SubscribeMessage('message')
  async handleEvent(@MessageBody() data: MessageRequest, @ConnectedSocket() client: AuthSocket): Promise<Message> {
    console.log(data);
    const message = await this.messageService.create({
      from: client.user,
      recipient: data.recipient,
      message: data.message,
    });
    this.server.to(data.recipient).emit("message", message);
    return message;
  }
}