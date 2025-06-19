import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TagsService, TagFilters } from './tags.service';
import { TagType, Prisma } from '@prisma/client';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('tags')
@ApiBearerAuth()
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create or update a tag',
    description:
      "Creates a new tag if it doesn't exist, or updates the existing tag if it does.",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the tag',
          example: 'urgent',
        },
        type: {
          type: 'string',
          enum: ['PROJECT', 'IMAGE'],
          description: 'The type of tag',
          example: 'PROJECT',
        },
        color: {
          type: 'string',
          description: 'The color of the tag (hex format)',
          example: '#FF0000',
        },
        organizationId: {
          type: 'string',
          description: 'The ID of the organization this tag belongs to',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['name', 'type', 'organizationId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tag created or updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string', enum: ['PROJECT', 'IMAGE'] },
        color: { type: 'string' },
        organizationId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Req() req: RequestWithUser,
    @Body()
    data: {
      name: string;
      type: TagType;
      color?: string;
      organizationId: string;
    },
  ): Promise<Prisma.TagGetPayload<{}>> {
    return this.tagsService.upsertTag(data);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tags for an organization',
    description:
      'Retrieves all tags for a specific organization with optional filtering by type and search term.',
  })
  @ApiQuery({
    name: 'type',
    description: 'Filter by tag type',
    required: false,
    enum: ['PROJECT', 'IMAGE'],
  })
  @ApiQuery({
    name: 'searchTerm',
    description: 'Search tags by name',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'organizationId',
    description: 'Organization ID',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of tags retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['PROJECT', 'IMAGE'] },
          color: { type: 'string' },
          organizationId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - organizationId required',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('type') type?: TagType,
    @Query('searchTerm') searchTerm?: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<Prisma.TagGetPayload<{}>[]> {
    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    const filters: TagFilters = {
      organizationId,
      ...(type && { type }),
      ...(searchTerm && { searchTerm }),
    };

    return this.tagsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a tag by ID',
    description: 'Retrieves a specific tag by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string', enum: ['PROJECT', 'IMAGE'] },
        color: { type: 'string' },
        organizationId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('id') id: string,
  ): Promise<Prisma.TagGetPayload<{}> | null> {
    return this.tagsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a tag',
    description: "Updates an existing tag's name and/or color.",
  })
  @ApiParam({
    name: 'id',
    description: 'Tag ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The new name of the tag',
          example: 'very-urgent',
        },
        color: {
          type: 'string',
          description: 'The new color of the tag (hex format)',
          example: '#FF0000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string', enum: ['PROJECT', 'IMAGE'] },
        color: { type: 'string' },
        organizationId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - tag name already exists',
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string; color?: string },
  ): Promise<Prisma.TagGetPayload<{}>> {
    return this.tagsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a tag',
    description:
      'Deletes a tag by its ID. This will also remove the tag from all projects and images.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag deleted successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string', enum: ['PROJECT', 'IMAGE'] },
        color: { type: 'string' },
        organizationId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string): Promise<Prisma.TagGetPayload<{}>> {
    return this.tagsService.delete(id);
  }

  // Project tag endpoints
  @Post('projects/:projectId/set')
  @ApiOperation({
    summary: 'Set project tags (replace all)',
    description:
      "Replaces all existing tags on a project with the provided tag names. Creates tags if they don't exist.",
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tagNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag names to set on the project',
          example: ['urgent', 'high-priority', 'water-damage'],
        },
        organizationId: {
          type: 'string',
          description: 'Organization ID',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['tagNames', 'organizationId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Project tags set successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - project not found or does not belong to organization',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setProjectTags(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string,
    @Body() data: { tagNames: string[]; organizationId: string },
  ): Promise<Prisma.ProjectGetPayload<{ include: { tags: true } }>> {
    return this.tagsService.setProjectTags(
      projectId,
      data.tagNames,
      data.organizationId,
    );
  }

  @Post('projects/:projectId/add')
  @ApiOperation({
    summary: 'Add tags to project',
    description:
      "Adds new tags to a project while keeping existing tags. Creates tags if they don't exist.",
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tagNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag names to add to the project',
          example: ['urgent', 'high-priority'],
        },
        organizationId: {
          type: 'string',
          description: 'Organization ID',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['tagNames', 'organizationId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tags added to project successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - project not found or does not belong to organization',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addProjectTags(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string,
    @Body() data: { tagNames: string[]; organizationId: string },
  ): Promise<Prisma.ProjectGetPayload<{ include: { tags: true } }>> {
    return this.tagsService.addProjectTags(
      projectId,
      data.tagNames,
      data.organizationId,
    );
  }

  @Delete('projects/:projectId/remove')
  @ApiOperation({
    summary: 'Remove tags from project',
    description:
      'Removes specific tags from a project while keeping other tags.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tagNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag names to remove from the project',
          example: ['urgent', 'high-priority'],
        },
        organizationId: {
          type: 'string',
          description: 'Organization ID',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['tagNames', 'organizationId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tags removed from project successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - project not found or does not belong to organization',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeProjectTags(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string,
    @Body() data: { tagNames: string[]; organizationId: string },
  ): Promise<Prisma.ProjectGetPayload<{ include: { tags: true } }>> {
    return this.tagsService.removeProjectTags(
      projectId,
      data.tagNames,
      data.organizationId,
    );
  }

  // Image tag endpoints
  @Post('images/:imageId/set')
  @ApiOperation({
    summary: 'Set image tags (replace all)',
    description:
      "Replaces all existing tags on an image with the provided tag names. Creates tags if they don't exist.",
  })
  @ApiParam({
    name: 'imageId',
    description: 'Image ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tagNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag names to set on the image',
          example: ['damage', 'water', 'mold'],
        },
        organizationId: {
          type: 'string',
          description: 'Organization ID',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['tagNames', 'organizationId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image tags set successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        url: { type: 'string' },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - image not found or does not belong to organization',
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setImageTags(
    @Req() req: RequestWithUser,
    @Param('imageId') imageId: string,
    @Body() data: { tagNames: string[]; organizationId: string },
  ): Promise<Prisma.ImageGetPayload<{ include: { tags: true } }>> {
    return this.tagsService.setImageTags(
      imageId,
      data.tagNames,
      data.organizationId,
    );
  }

  @Post('images/:imageId/add')
  @ApiOperation({
    summary: 'Add tags to image',
    description:
      "Adds new tags to an image while keeping existing tags. Creates tags if they don't exist.",
  })
  @ApiParam({
    name: 'imageId',
    description: 'Image ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tagNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag names to add to the image',
          example: ['damage', 'water'],
        },
        organizationId: {
          type: 'string',
          description: 'Organization ID',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['tagNames', 'organizationId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tags added to image successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        url: { type: 'string' },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - image not found or does not belong to organization',
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addImageTags(
    @Req() req: RequestWithUser,
    @Param('imageId') imageId: string,
    @Body() data: { tagNames: string[]; organizationId: string },
  ): Promise<Prisma.ImageGetPayload<{ include: { tags: true } }>> {
    return this.tagsService.addImageTags(
      imageId,
      data.tagNames,
      data.organizationId,
    );
  }

  @Delete('images/:imageId/remove')
  @ApiOperation({
    summary: 'Remove tags from image',
    description:
      'Removes specific tags from an image while keeping other tags.',
  })
  @ApiParam({
    name: 'imageId',
    description: 'Image ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tagNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag names to remove from the image',
          example: ['damage', 'water'],
        },
        organizationId: {
          type: 'string',
          description: 'Organization ID',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['tagNames', 'organizationId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tags removed from image successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        url: { type: 'string' },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - image not found or does not belong to organization',
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeImageTags(
    @Req() req: RequestWithUser,
    @Param('imageId') imageId: string,
    @Body() data: { tagNames: string[]; organizationId: string },
  ): Promise<Prisma.ImageGetPayload<{ include: { tags: true } }>> {
    return this.tagsService.removeImageTags(
      imageId,
      data.tagNames,
      data.organizationId,
    );
  }

  // Bulk operations
  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk create or update tags',
    description:
      'Creates or updates multiple tags at once. Returns results for successful operations and errors for failed ones.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The name of the tag',
                example: 'urgent',
              },
              type: {
                type: 'string',
                enum: ['PROJECT', 'IMAGE'],
                description: 'The type of tag',
                example: 'PROJECT',
              },
              color: {
                type: 'string',
                description: 'The color of the tag (hex format)',
                example: '#FF0000',
              },
              organizationId: {
                type: 'string',
                description: 'The ID of the organization this tag belongs to',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
            },
            required: ['name', 'type', 'organizationId'],
          },
          description: 'Array of tags to create or update',
        },
      },
      required: ['tags'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tags created or updated successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['PROJECT', 'IMAGE'] },
          color: { type: 'string' },
          organizationId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Partial failure - some tags failed to create/update',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'partial-failure' },
        created: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkUpsertTags(
    @Req() req: RequestWithUser,
    @Body()
    data: {
      tags: Array<{
        name: string;
        type: TagType;
        color?: string;
        organizationId: string;
      }>;
    },
  ): Promise<Prisma.TagGetPayload<{}>[]> {
    return this.tagsService.bulkUpsertTags(data.tags);
  }

  // Statistics
  @Get('stats/:organizationId')
  @ApiOperation({
    summary: 'Get tag statistics for an organization',
    description:
      'Retrieves statistics about tags in an organization including counts and most used tags.',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalTags: {
          type: 'number',
          description: 'Total number of tags in the organization',
        },
        projectTags: {
          type: 'number',
          description: 'Number of project tags',
        },
        imageTags: {
          type: 'number',
          description: 'Number of image tags',
        },
        mostUsedTags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string', enum: ['PROJECT', 'IMAGE'] },
              color: { type: 'string' },
              usageCount: { type: 'number' },
            },
          },
          description: 'Top 10 most used tags',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTagStats(@Param('organizationId') organizationId: string) {
    return this.tagsService.getTagStats(organizationId);
  }
}
