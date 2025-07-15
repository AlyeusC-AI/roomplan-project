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
import {
  CreateChatMessageDto,
  MessageType,
} from './dto/create-chat-message.dto';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  chatId?: string;
  data: {
    user: {
      userId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      organizationId?: string;
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
    private readonly notificationsService: NotificationsService,
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
    if (client.chatId) {
      client.leave(`chat:${client.chatId}`);
    }
  }

  @SubscribeMessage('joinChat')
  @UseGuards(WsJwtGuard)
  async handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Verify user has access to the chat
      await this.chatService.getChatById(data.chatId, client.userId);

      // Join the chat room
      client.chatId = data.chatId;
      await client.join(`chat:${data.chatId}`);

      // Notify others that user joined
      client.to(`chat:${data.chatId}`).emit('userJoined', {
        userId: client.userId,
        timestamp: new Date(),
      });

      return { success: true, message: 'Joined chat' };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('leaveChat')
  @UseGuards(WsJwtGuard)
  async handleLeaveChat(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.chatId) {
      await client.leave(`chat:${client.chatId}`);

      // Notify others that user left
      client.to(`chat:${client.chatId}`).emit('userLeft', {
        userId: client.userId,
        timestamp: new Date(),
      });

      client.chatId = undefined;
    }
    return { success: true, message: 'Left chat' };
  }

  @SubscribeMessage('sendMessage')
  @UseGuards(WsJwtGuard)
  async handleSendMessage(
    @MessageBody()
    data: {
      chatId: string;
      content: string;
      type?: MessageType;
      replyToId?: string;
      attachments?: any[];
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Create message using the service
      const createMessageDto = new CreateChatMessageDto();
      createMessageDto.content = data.content;
      createMessageDto.type = data.type || MessageType.TEXT;
      createMessageDto.replyToId = data.replyToId;
      createMessageDto.attachments = data.attachments;

      const message = await this.chatService.createMessage(
        data.chatId,
        client.userId,
        createMessageDto,
      );

      // Broadcast message to all users in the chat
      this.server.to(`chat:${data.chatId}`).emit('newMessage', {
        id: message.id,
        content: message.content,
        type: message.type,
        userId: message.user.id,
        user: {
          id: message.user.id,
          firstName: message.user.firstName,
          lastName: message.user.lastName,
          email: message.user.email,
          avatar: message.user.avatar,
        },
        replyTo: message.replyTo,
        attachments: message.attachments,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        isEdited: message.isEdited,
      });

      // Send push notification to chat participants (excluding sender)
      try {
        await this.notificationsService.sendChatMessageNotification(
          data.chatId,
          client.userId,
          data.content,
          data.type || MessageType.TEXT,
        );
      } catch (error) {
        console.error('Failed to send push notification:', error);
        // Don't fail the message send if notification fails
      }

      return { success: true, message: 'Message sent' };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('updateMessage')
  @UseGuards(WsJwtGuard)
  async handleUpdateMessage(
    @MessageBody() data: { messageId: string; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      const updatedMessage = await this.chatService.updateMessage(
        data.messageId,
        client.userId,
        data.content,
      );

      // Broadcast updated message to all users in the chat
      this.server.to(`chat:${updatedMessage.chatId}`).emit('messageUpdated', {
        id: updatedMessage.id,
        content: updatedMessage.content,
        type: updatedMessage.type,
        userId: updatedMessage.user.id,
        user: {
          id: updatedMessage.user.id,
          firstName: updatedMessage.user.firstName,
          lastName: updatedMessage.user.lastName,
          email: updatedMessage.user.email,
          avatar: updatedMessage.user.avatar,
        },
        replyTo: updatedMessage.replyTo,
        attachments: updatedMessage.attachments,
        createdAt: updatedMessage.createdAt,
        updatedAt: updatedMessage.updatedAt,
        isEdited: updatedMessage.isEdited,
      });

      return { success: true, message: 'Message updated' };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('deleteMessage')
  @UseGuards(WsJwtGuard)
  async handleDeleteMessage(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      const result = await this.chatService.deleteMessage(
        data.messageId,
        client.userId,
      );

      // Broadcast message deletion to all users in the chat
      this.server.emit('messageDeleted', {
        messageId: data.messageId,
        timestamp: new Date(),
      });

      return { success: true, message: 'Message deleted' };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('typing')
  @UseGuards(WsJwtGuard)
  async handleTyping(
    @MessageBody() data: { chatId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (client.userId && data.chatId) {
      client.to(`chat:${data.chatId}`).emit('userTyping', {
        userId: client.userId,
        isTyping: data.isTyping,
      });
    }
  }

  @SubscribeMessage('stopTyping')
  @UseGuards(WsJwtGuard)
  async handleStopTyping(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (client.userId && data.chatId) {
      client.to(`chat:${data.chatId}`).emit('userTyping', {
        userId: client.userId,
        isTyping: false,
      });
    }
  }

  // Project-specific methods (for backward compatibility)
  @SubscribeMessage('joinProject')
  @UseGuards(WsJwtGuard)
  async handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Get or create project chat
      const chat = await this.chatService.getOrCreateProjectChat(
        data.projectId,
        client.userId,
      );

      // Join the chat room
      client.chatId = chat.id;
      await client.join(`chat:${chat.id}`);

      // Notify others that user joined
      client.to(`chat:${chat.id}`).emit('userJoined', {
        userId: client.userId,
        timestamp: new Date(),
      });

      return { success: true, message: 'Joined project chat', chatId: chat.id };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('leaveProject')
  @UseGuards(WsJwtGuard)
  async handleLeaveProject(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.chatId) {
      await client.leave(`chat:${client.chatId}`);

      // Notify others that user left
      client.to(`chat:${client.chatId}`).emit('userLeft', {
        userId: client.userId,
        timestamp: new Date(),
      });

      client.chatId = undefined;
    }
    return { success: true, message: 'Left project chat' };
  }
}
