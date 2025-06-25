import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateChat(projectId: string, userId: string) {
    // Verify user has access to the project
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId,
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Get or create chat for the project
    let chat = await this.prisma.chat.findUnique({
      where: { projectId },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          projectId,
        },
      });
    }

    return chat;
  }

  async getMessages(
    projectId: string,
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    // Verify access and get chat
    const chat = await this.getOrCreateChat(projectId, userId);

    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationDto;
    const skip = (page - 1) * limit;

    const [total, messages] = await Promise.all([
      this.prisma.chatMessage.count({
        where: { chatId: chat.id },
      }),
      this.prisma.chatMessage.findMany({
        where: { chatId: chat.id },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return {
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createMessage(
    projectId: string,
    userId: string,
    createChatMessageDto: CreateChatMessageDto,
  ) {
    // Verify access and get chat
    const chat = await this.getOrCreateChat(projectId, userId);

    // Create the message
    const message = await this.prisma.chatMessage.create({
      data: {
        content: createChatMessageDto.content,
        chatId: chat.id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return message;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is the message author or has access to the project
    if (message.userId !== userId) {
      // Verify user has access to the project
      const project = await this.prisma.project.findFirst({
        where: {
          id: message.chat.projectId,
          members: {
            some: {
              id: userId,
            },
          },
        },
      });

      if (!project) {
        throw new ForbiddenException('You can only delete your own messages');
      }
    }

    await this.prisma.chatMessage.delete({
      where: { id: messageId },
    });

    return { success: true };
  }
}
