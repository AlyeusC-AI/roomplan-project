import {
  Controller,
  Get,
  Post,
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
  getMessages(
    @Param('projectId') projectId: string,
    @Request() req: RequestWithUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    return this.chatService.getMessages(
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
  createMessage(
    @Param('projectId') projectId: string,
    @Body() createChatMessageDto: CreateChatMessageDto,
    @Request() req: RequestWithUser,
  ) {
    return this.chatService.createMessage(
      projectId,
      req.user.userId,
      createChatMessageDto,
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
}
