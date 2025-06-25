import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  projectId?: string;
  data: {
    user: {
      userId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      organizationId?: string;
      projectId?: string;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);

    // Extract token from handshake
    const token = this.extractTokenFromHeader(client);

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token);
        client.data.user = {
          userId: payload.sub,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: payload.role,
          organizationId: payload.organizationId,
          projectId: payload.projectId,
        };
        client.userId = client.data.user.userId;
        console.log('User authenticated on connection:', client.userId);
      } catch (error) {
        console.log('Authentication failed on connection:', error.message);
        client.disconnect();
        return;
      }
    } else {
      console.log('No token found on connection');
      client.disconnect();
      return;
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth =
      client.handshake.auth.token || client.handshake.headers.authorization;

    if (!auth) {
      return undefined;
    }

    if (auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }

    return auth;
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    if (client.projectId) {
      client.leave(`project:${client.projectId}`);
    }
  }

  @SubscribeMessage('joinProject')
  @UseGuards(WsJwtGuard)
  async handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('🚀 ~ ChatGateway ~ client:', client.data);
    try {
      // User is already authenticated by WsJwtGuard
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Join the project room
      client.projectId = data.projectId;
      await client.join(`project:${data.projectId}`);

      // Notify others that user joined
      client.to(`project:${data.projectId}`).emit('userJoined', {
        userId: client.userId,
        timestamp: new Date(),
      });

      return { success: true, message: 'Joined project chat' };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('leaveProject')
  @UseGuards(WsJwtGuard)
  async handleLeaveProject(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.projectId) {
      await client.leave(`project:${client.projectId}`);

      // Notify others that user left
      client.to(`project:${client.projectId}`).emit('userLeft', {
        userId: client.userId,
        timestamp: new Date(),
      });

      client.projectId = undefined;
    }
    return { success: true, message: 'Left project chat' };
  }

  @SubscribeMessage('sendMessage')
  @UseGuards(WsJwtGuard)
  async handleSendMessage(
    @MessageBody() data: { projectId: string; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Create message using the service
      const createMessageDto = new CreateChatMessageDto();
      createMessageDto.content = data.content;

      const message = await this.chatService.createMessage(
        data.projectId,
        client.userId,
        createMessageDto,
      );

      // Broadcast message to all users in the project
      this.server.to(`project:${data.projectId}`).emit('newMessage', {
        id: message.id,
        content: message.content,
        userId: message.user.id,
        user: {
          id: message.user.id,
          firstName: message.user.firstName,
          lastName: message.user.lastName,
          email: message.user.email,
          avatar: message.user.avatar,
        },
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });

      return { success: true, message: 'Message sent' };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('typing')
  @UseGuards(WsJwtGuard)
  async handleTyping(
    @MessageBody() data: { projectId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (client.userId && data.projectId) {
      client.to(`project:${data.projectId}`).emit('userTyping', {
        userId: client.userId,
        isTyping: data.isTyping,
      });
    }
  }

  @SubscribeMessage('stopTyping')
  @UseGuards(WsJwtGuard)
  async handleStopTyping(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (client.userId && data.projectId) {
      client.to(`project:${data.projectId}`).emit('userTyping', {
        userId: client.userId,
        isTyping: false,
      });
    }
  }
}
