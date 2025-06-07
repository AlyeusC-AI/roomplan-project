import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Note, Role, MemberStatus } from '@prisma/client';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    // Check if user has access to the room's project
    const room = await this.prisma.room.findUnique({
      where: { id: createNoteDto.roomId },
      include: { project: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: room.project.organizationId,
        userId: userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create notes in this room',
      );
    }

    return this.prisma.note.create({
      data: createNoteDto,
    });
  }

  async findAll(roomId: string, userId: string): Promise<Note[]> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { project: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: room.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view notes in this room',
      );
    }

    return this.prisma.note.findMany({
      where: { roomId },
      include: { images: true },
    });
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: note.room.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view this note',
      );
    }

    return note;
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    userId: string,
  ): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: note.room.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update notes in this room',
      );
    }

    return this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });
  }

  async remove(id: string, userId: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: note.room.project.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        role: { in: [Role.OWNER, Role.ADMIN, Role.PROJECT_MANAGER] },
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete notes in this room',
      );
    }

    return this.prisma.note.delete({
      where: { id },
    });
  }
}
