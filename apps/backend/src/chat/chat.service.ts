import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateChatMessageDto,
  MessageType,
} from './dto/create-chat-message.dto';
import { CreateChatDto, ChatType } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Chat Management
  async createChat(
    organizationId: string,
    userId: string,
    createChatDto: CreateChatDto,
  ) {
    const { type, name, projectId, participantIds } = createChatDto;

    // For project chats, automatically get all project members
    let finalParticipantIds = participantIds || [];
    console.log('🚀 ~ ChatService ~ finalParticipantIds:', finalParticipantIds);

    // Auto-add current user to participants for private and group chats
    if (type === ChatType.PRIVATE || type === ChatType.GROUP) {
      if (!finalParticipantIds.includes(userId)) {
        finalParticipantIds = [userId, ...finalParticipantIds];
      }
    }

    if (type === ChatType.PROJECT && projectId) {
      const projectMembers = await this.prisma.user.findMany({
        where: {
          OR: [
            {
              organizationMemberships: {
                some: {
                  organizationId,
                  status: 'ACTIVE',
                  role: { in: ['OWNER', 'ADMIN'] },
                },
              },
            },
            {
              projects: {
                some: {
                  id: projectId,
                },
              },
            },
          ],
        },
      });
      finalParticipantIds = projectMembers.map((member) => member.id);
    }
    console.log('🚀 ~ ChatService ~ finalParticipantIds:', finalParticipantIds);

    // Validate participants are in the same organization

    // For private chats, ensure exactly 2 participants (current user + 1 other)
    if (type === ChatType.PRIVATE && finalParticipantIds.length !== 2) {
      throw new BadRequestException(
        'Private chats must have exactly 2 participants',
      );
    }

    // For group chats, ensure name is provided
    if (type === ChatType.GROUP && !name) {
      throw new BadRequestException('Group chats must have a name');
    }

    // For project chats, validate project access
    if (type === ChatType.PROJECT && projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
        },
      });

      if (!project) {
        throw new ForbiddenException('Project not found or access denied');
      }
    }

    // Check if private chat already exists
    if (type === ChatType.PRIVATE) {
      const existingChat = await this.prisma.chat.findFirst({
        where: {
          type: ChatType.PRIVATE,
          organizationId,
          participants: {
            every: {
              userId: { in: finalParticipantIds },
            },
          },
        },
        include: {
          participants: {
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
          },
          project: {
            select: {
              id: true,
              name: true,
              clientName: true,
            },
          },
        },
      });

      if (existingChat && existingChat.participants.length === 2) {
        return existingChat;
      }
    }
    if (type === ChatType.PROJECT) {
      const isChatExists = await this.prisma.chat.findFirst({
        where: {
          type,
          projectId,
          // organizationId,
        },
        include: {
          participants: {
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
          },
          project: {
            select: {
              id: true,
              name: true,
              clientName: true,
            },
          },
        },
      });

      if (isChatExists) {
        return isChatExists;
      }
    }

    // Create the chat
    const chat = await this.prisma.chat.create({
      data: {
        type,
        name,
        projectId,
        organizationId,
        participants: {
          create: finalParticipantIds.map((participantId) => ({
            userId: participantId,
          })),
        },
      },
      include: {
        participants: {
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
        },
        project: {
          select: {
            id: true,
            name: true,
            clientName: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
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
            replyTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            attachments: true,
          },
        },
      },
    });

    // Transform the response to include lastMessage field for easier access
    return {
      ...chat,
      lastMessage: chat.messages[0] || null,
    };
  }

  async getUserChats(organizationId: string, userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        organizationId,
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
      include: {
        participants: {
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
        },
        project: {
          select: {
            id: true,
            name: true,
            clientName: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
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
            replyTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            attachments: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Transform the response to include lastMessage field for easier access
    return chats.map((chat) => ({
      ...chat,
      lastMessage: chat.messages[0] || null,
    }));
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
      include: {
        participants: {
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
        },
        project: {
          select: {
            id: true,
            name: true,
            clientName: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
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
            replyTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            attachments: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Transform the response to include lastMessage field for easier access
    return {
      ...chat,
      lastMessage: chat.messages[0] || null,
    };
  }

  async updateChat(
    chatId: string,
    userId: string,
    updateChatDto: UpdateChatDto,
  ) {
    const chat = await this.getChatById(chatId, userId);

    // Only group chats can be updated
    if (chat.type !== ChatType.GROUP) {
      throw new BadRequestException('Only group chats can be updated');
    }

    const updateData: any = {};

    if (updateChatDto.name) {
      updateData.name = updateChatDto.name;
    }

    if (updateChatDto.addParticipantIds?.length) {
      // Validate new participants are in the same organization
      const newParticipants = await this.prisma.user.findMany({
        where: {
          id: { in: updateChatDto.addParticipantIds },
          organizationMemberships: {
            some: {
              organizationId: chat.organizationId
                ? {
                    equals: chat.organizationId,
                  }
                : undefined,
              status: 'ACTIVE',
            },
          },
        },
      });

      if (newParticipants.length !== updateChatDto.addParticipantIds.length) {
        throw new BadRequestException(
          'Some participants are not in your organization',
        );
      }
    }

    const updatedChat = await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        ...updateData,
        ...(updateChatDto.addParticipantIds?.length && {
          participants: {
            create: updateChatDto.addParticipantIds.map((participantId) => ({
              userId: participantId,
            })),
          },
        }),
        ...(updateChatDto.removeParticipantIds?.length && {
          participants: {
            updateMany: {
              where: {
                userId: { in: updateChatDto.removeParticipantIds },
              },
              data: {
                isActive: false,
                leftAt: new Date(),
              },
            },
          },
        }),
      },
      include: {
        participants: {
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
        },
        project: {
          select: {
            id: true,
            name: true,
            clientName: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
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
            replyTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            attachments: true,
          },
        },
      },
    });

    // Transform the response to include lastMessage field for easier access
    return {
      ...updatedChat,
      lastMessage: updatedChat.messages[0] || null,
    };
  }

  async leaveChat(chatId: string, userId: string) {
    const chat = await this.getChatById(chatId, userId);

    await this.prisma.chatParticipant.updateMany({
      where: {
        chatId,
        userId,
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });

    return { success: true };
  }

  // Message Management
  async getMessages(
    chatId: string,
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    // Verify access to chat
    await this.getChatById(chatId, userId);

    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationDto;
    const skip = (page - 1) * limit;

    const [total, messages] = await Promise.all([
      this.prisma.chatMessage.count({
        where: {
          chatId,
          isDeleted: false,
        },
      }),
      this.prisma.chatMessage.findMany({
        where: {
          chatId,
          isDeleted: false,
        },
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
          replyTo: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          attachments: true,
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
    chatId: string,
    userId: string,
    createChatMessageDto: CreateChatMessageDto,
  ) {
    // Verify access to chat
    await this.getChatById(chatId, userId);

    const {
      content,
      type = MessageType.TEXT,
      replyToId,
      attachments,
    } = createChatMessageDto;

    // Validate reply message exists and is in the same chat
    if (replyToId) {
      const replyMessage = await this.prisma.chatMessage.findFirst({
        where: {
          id: replyToId,
          chatId,
          isDeleted: false,
        },
      });

      if (!replyMessage) {
        throw new NotFoundException('Reply message not found');
      }
    }

    // Create the message
    const message = await this.prisma.chatMessage.create({
      data: {
        content,
        type,
        chatId,
        userId,
        replyToId,
        ...(attachments?.length && {
          attachments: {
            create: attachments.map((attachment) => ({
              fileName: attachment.fileName,
              fileUrl: attachment.fileUrl,
              fileSize: attachment.fileSize,
              mimeType: attachment.mimeType,
              thumbnailUrl: attachment.thumbnailUrl,
            })),
          },
        }),
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
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        attachments: true,
      },
    });

    // Update chat's lastMessageAt
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async updateMessage(messageId: string, userId: string, content: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is the message author
    if (message.userId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Check if user is still in the chat
    const isParticipant = message.chat.participants.some(
      (p) => p.userId === userId && p.isActive,
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are no longer a participant in this chat',
      );
    }

    const updatedMessage = await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        updatedAt: new Date(),
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
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        attachments: true,
      },
    });

    return updatedMessage;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is the message author or has admin access
    if (message.userId !== userId) {
      // Check if user has admin access to the organization
      const userMembership = await this.prisma.organizationMember.findFirst({
        where: {
          userId,
          organizationId: message.chat.organizationId
            ? {
                equals: message.chat.organizationId,
              }
            : undefined,
          status: 'ACTIVE',
          role: { in: ['OWNER', 'ADMIN'] },
        },
      });

      if (!userMembership) {
        throw new ForbiddenException('You can only delete your own messages');
      }
    }

    // Soft delete the message
    await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: '[Message deleted]',
      },
    });

    return { success: true };
  }

  // Project-specific methods (for backward compatibility)
  async getOrCreateProjectChat(projectId: string, userId: string) {
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
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Get or create chat for the project
    let chat = await this.prisma.chat.findUnique({
      where: { projectId },
      include: {
        participants: {
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
        },
        project: {
          select: {
            id: true,
            name: true,
            clientName: true,
          },
        },
      },
    });

    if (!chat) {
      // Create project chat - createChat will automatically add all project members
      chat = await this.createChat(project.organizationId, userId, {
        type: ChatType.PROJECT,
        projectId,
        participantIds: [], // Will be automatically populated with all project members
      });
    }

    if (!chat) {
      throw new NotFoundException('Failed to create or find project chat');
    }

    return chat;
  }

  async getProjectMessages(
    projectId: string,
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    const chat = await this.getOrCreateProjectChat(projectId, userId);
    return this.getMessages(chat.id, userId, paginationDto);
  }

  async createProjectMessage(
    projectId: string,
    userId: string,
    createChatMessageDto: CreateChatMessageDto,
  ) {
    const chat = await this.getOrCreateProjectChat(projectId, userId);
    return this.createMessage(chat.id, userId, createChatMessageDto);
  }
}
