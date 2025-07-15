import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagType, Prisma } from '@prisma/client';

export interface TagFilters {
  type?: TagType;
  organizationId: string;
  searchTerm?: string;
}

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  // Create or find a tag
  async upsertTag(data: {
    name: string;
    type: TagType;
    color?: string;
    organizationId: string;
  }): Promise<Prisma.TagGetPayload<{}>> {
    return this.prisma.tag.upsert({
      where: {
        name_type_organizationId: {
          name: data.name,
          type: data.type,
          organizationId: data.organizationId,
        },
      },
      update: {
        color: data.color,
      },
      create: {
        name: data.name,
        type: data.type,
        color: data.color || '#3B82F6',
        organizationId: data.organizationId,
      },
    });
  }

  // Get all tags for an organization with optional filtering
  async findAll(filters: TagFilters): Promise<Prisma.TagGetPayload<{}>[]> {
    const where: Prisma.TagWhereInput = {
      organizationId: filters.organizationId,
      ...(filters.type && { type: filters.type }),
      ...(filters.searchTerm && {
        name: {
          contains: filters.searchTerm,
          mode: 'insensitive',
        },
      }),
    };

    return this.prisma.tag.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Get a single tag by ID
  async findOne(id: string): Promise<Prisma.TagGetPayload<{}> | null> {
    return this.prisma.tag.findUnique({
      where: { id },
    });
  }

  // Update a tag
  async update(
    id: string,
    data: {
      name?: string;
      color?: string;
    },
  ): Promise<Prisma.TagGetPayload<{}>> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // If name is being updated, check for conflicts
    if (data.name && data.name !== tag.name) {
      const existingTag = await this.prisma.tag.findUnique({
        where: {
          name_type_organizationId: {
            name: data.name,
            type: tag.type,
            organizationId: tag.organizationId,
          },
        },
      });

      if (existingTag) {
        throw new BadRequestException({
          status: 'failed',
          reason: 'existing-tag',
          message: 'Tag name already exists for this organization and type.',
        });
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  // Delete a tag
  async delete(id: string): Promise<Prisma.TagGetPayload<{}>> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.prisma.tag.delete({
      where: { id },
    });
  }

  // Set tags for a project (replace all existing tags)
  async setProjectTags(
    projectId: string,
    tagNames: string[],
    organizationId: string,
  ): Promise<Prisma.ProjectGetPayload<{ include: { tags: true } }>> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tags: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.organizationId !== organizationId) {
      throw new BadRequestException(
        'Project does not belong to the organization',
      );
    }

    // Upsert all tags
    const tagIds: string[] = [];
    for (const tagName of tagNames) {
      const tag = await this.upsertTag({
        name: tagName,
        type: 'PROJECT',
        organizationId,
      });
      tagIds.push(tag.id);
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        tags: {
          set: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  // Set tags for an image (replace all existing tags)
  async setImageTags(
    imageId: string,
    tagNames: string[],
    organizationId: string,
  ): Promise<Prisma.ImageGetPayload<{ include: { tags: true } }>> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
      include: {
        tags: true,
        project: true,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.project.organizationId !== organizationId) {
      throw new BadRequestException(
        'Image does not belong to the organization',
      );
    }

    // Upsert all tags
    const tagIds: string[] = [];
    for (const tagName of tagNames) {
      const tag = await this.upsertTag({
        name: tagName,
        type: 'IMAGE',
        organizationId,
      });
      tagIds.push(tag.id);
    }

    return this.prisma.image.update({
      where: { id: imageId },
      data: {
        tags: {
          set: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  // Add tags to a project (keep existing tags)
  async addProjectTags(
    projectId: string,
    tagNames: string[],
    organizationId: string,
  ): Promise<Prisma.ProjectGetPayload<{ include: { tags: true } }>> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tags: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.organizationId !== organizationId) {
      throw new BadRequestException(
        'Project does not belong to the organization',
      );
    }

    // Upsert all tags
    const tagIds: string[] = [];
    for (const tagName of tagNames) {
      const tag = await this.upsertTag({
        name: tagName,
        type: 'PROJECT',
        organizationId,
      });
      tagIds.push(tag.id);
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  // Add tags to an image (keep existing tags)
  async addImageTags(
    imageId: string,
    tagNames: string[],
    organizationId: string,
  ): Promise<Prisma.ImageGetPayload<{ include: { tags: true } }>> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
      include: {
        tags: true,
        project: true,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.project.organizationId !== organizationId) {
      throw new BadRequestException(
        'Image does not belong to the organization',
      );
    }

    // Upsert all tags
    const tagIds: string[] = [];
    for (const tagName of tagNames) {
      const tag = await this.upsertTag({
        name: tagName,
        type: 'IMAGE',
        organizationId,
      });
      tagIds.push(tag.id);
    }

    return this.prisma.image.update({
      where: { id: imageId },
      data: {
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  // Remove tags from a project
  async removeProjectTags(
    projectId: string,
    tagNames: string[],
    organizationId: string,
  ): Promise<Prisma.ProjectGetPayload<{ include: { tags: true } }>> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tags: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Find existing tags by names
    const existingTags = await this.prisma.tag.findMany({
      where: {
        name: { in: tagNames },
        type: 'PROJECT',
        organizationId,
      },
    });

    const tagIds = existingTags.map((tag) => tag.id);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        tags: {
          disconnect: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  // Remove tags from an image
  async removeImageTags(
    imageId: string,
    tagNames: string[],
    organizationId: string,
  ): Promise<Prisma.ImageGetPayload<{ include: { tags: true } }>> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
      include: {
        tags: true,
        project: true,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // Find existing tags by names
    const existingTags = await this.prisma.tag.findMany({
      where: {
        name: { in: tagNames },
        type: 'IMAGE',
        organizationId,
      },
    });

    const tagIds = existingTags.map((tag) => tag.id);

    return this.prisma.image.update({
      where: { id: imageId },
      data: {
        tags: {
          disconnect: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  // Get projects by tag name
  async getProjectsByTag(
    tagName: string,
    organizationId: string,
  ): Promise<Prisma.ProjectGetPayload<{ include: { tags: true } }>[]> {
    const tag = await this.prisma.tag.findUnique({
      where: {
        name_type_organizationId: {
          name: tagName,
          type: 'PROJECT',
          organizationId,
        },
      },
    });

    if (!tag) {
      return [];
    }

    return this.prisma.project.findMany({
      where: {
        tags: {
          some: {
            id: tag.id,
          },
        },
        organizationId,
      },
      include: {
        tags: true,
      },
    });
  }

  // Get images by tag name
  async getImagesByTag(
    tagName: string,
    organizationId: string,
  ): Promise<Prisma.ImageGetPayload<{ include: { tags: true } }>[]> {
    const tag = await this.prisma.tag.findUnique({
      where: {
        name_type_organizationId: {
          name: tagName,
          type: 'IMAGE',
          organizationId,
        },
      },
    });

    if (!tag) {
      return [];
    }

    return this.prisma.image.findMany({
      where: {
        tags: {
          some: {
            id: tag.id,
          },
        },
        project: {
          organizationId,
        },
      },
      include: {
        tags: true,
      },
    });
  }

  // Bulk upsert tags
  async bulkUpsertTags(
    tags: Array<{
      name: string;
      type: TagType;
      color?: string;
      organizationId: string;
    }>,
  ): Promise<Prisma.TagGetPayload<{}>[]> {
    const results: Prisma.TagGetPayload<{}>[] = [];
    const errors: { name: string; error: any }[] = [];

    for (const tagData of tags) {
      try {
        const tag = await this.upsertTag(tagData);
        results.push(tag);
      } catch (error) {
        errors.push({
          name: tagData.name,
          error: error.message,
        });
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        status: 'partial-failure',
        created: results,
        errors,
      });
    }

    return results;
  }

  // Get tag statistics for an organization
  async getTagStats(organizationId: string): Promise<{
    totalTags: number;
    projectTags: number;
    imageTags: number;
    mostUsedTags: Array<{
      id: string;
      name: string;
      type: TagType;
      color: string;
      usageCount: number;
    }>;
  }> {
    const [totalTags, projectTags, imageTags, mostUsedTags] = await Promise.all(
      [
        this.prisma.tag.count({
          where: { organizationId },
        }),
        this.prisma.tag.count({
          where: { organizationId, type: 'PROJECT' },
        }),
        this.prisma.tag.count({
          where: { organizationId, type: 'IMAGE' },
        }),
        this.prisma.tag.findMany({
          where: { organizationId },
          include: {
            _count: {
              select: {
                projects: true,
                images: true,
              },
            },
          },
          orderBy: [
            {
              projects: {
                _count: 'desc',
              },
            },
            {
              images: {
                _count: 'desc',
              },
            },
          ],
          take: 10,
        }),
      ],
    );

    return {
      totalTags,
      projectTags,
      imageTags,
      mostUsedTags: mostUsedTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        type: tag.type,
        color: tag.color || '#3B82F6',
        usageCount: tag._count.projects + tag._count.images,
      })),
    };
  }
}
