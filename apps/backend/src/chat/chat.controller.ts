import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { RequestWithUser } from '../auth/interfaces/request-with-user';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Chat Management
  @Post()
  @ApiOperation({ summary: 'Create a new chat (private, group, or project)' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({
    status: 201,
    description: 'The chat has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  createChat(
    @Body() createChatDto: CreateChatDto,
    @Request() req: RequestWithUser,
  ) {
    console.log('🚀 ~ ChatController ~ req:', req.user);
    return this.chatService.createChat(
      req.user.organizationId,
      req.user.userId,
      createChatDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all chats for the user.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getUserChats(@Request() req: RequestWithUser) {
    return this.chatService.getUserChats(
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get a specific chat by ID' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the chat details.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  getChatById(
    @Param('chatId') chatId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.chatService.getChatById(chatId, req.user.userId);
  }

  @Put(':chatId')
  @ApiOperation({ summary: 'Update a group chat' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiBody({ type: UpdateChatDto })
  @ApiResponse({
    status: 200,
    description: 'The chat has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  updateChat(
    @Param('chatId') chatId: string,
    @Body() updateChatDto: UpdateChatDto,
    @Request() req: RequestWithUser,
  ) {
    return this.chatService.updateChat(chatId, req.user.userId, updateChatDto);
  }

  @Post(':chatId/leave')
  @ApiOperation({ summary: 'Leave a chat' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully left the chat.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  leaveChat(@Param('chatId') chatId: string, @Request() req: RequestWithUser) {
    return this.chatService.leaveChat(chatId, req.user.userId);
  }

  // Message Management
  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get chat messages' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Return chat messages.',
    type: 'PaginatedResponse<ChatMessage>',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  getMessages(
    @Param('chatId') chatId: string,
    @Request() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    return this.chatService.getMessages(chatId, req.user.userId, paginationDto);
  }

  @Post(':chatId/messages')
  @ApiOperation({ summary: 'Create a new chat message' })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiBody({ type: CreateChatMessageDto })
  @ApiResponse({
    status: 201,
    description: 'The chat message has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  createMessage(
    @Param('chatId') chatId: string,
    @Body() createChatMessageDto: CreateChatMessageDto,
    @Request() req: RequestWithUser,
  ) {
    return this.chatService.createMessage(
      chatId,
      req.user.userId,
      createChatMessageDto,
    );
  }

  @Put('messages/:messageId')
  @ApiOperation({ summary: 'Update a chat message' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiBody({
    schema: { type: 'object', properties: { content: { type: 'string' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'The chat message has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  updateMessage(
    @Param('messageId') messageId: string,
    @Body() body: { content: string },
    @Request() req: RequestWithUser,
  ) {
    return this.chatService.updateMessage(
      messageId,
      req.user.userId,
      body.content,
    );
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete a chat message' })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiResponse({
    status: 200,
    description: 'The chat message has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  deleteMessage(
    @Param('messageId') messageId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.chatService.deleteMessage(messageId, req.user.userId);
  }

  // Project-specific endpoints (for backward compatibility)
  @Get('project/:projectId/messages')
  @ApiOperation({ summary: 'Get chat messages for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Return chat messages for the project.',
    type: 'PaginatedResponse<ChatMessage>',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getProjectMessages(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    return this.chatService.getProjectMessages(
      projectId,
      req.user.userId,
      paginationDto,
    );
  }

  @Post('project/:projectId/messages')
  @ApiOperation({ summary: 'Create a new chat message for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiBody({ type: CreateChatMessageDto })
  @ApiResponse({
    status: 201,
    description: 'The chat message has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  createProjectMessage(
    @Param('projectId') projectId: string,
    @Body() createChatMessageDto: CreateChatMessageDto,
    @Request() req: RequestWithUser,
  ) {
    return this.chatService.createProjectMessage(
      projectId,
      req.user.userId,
      createChatMessageDto,
    );
  }
}
