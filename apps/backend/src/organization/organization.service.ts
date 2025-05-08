import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Organization, Prisma, OrganizationMember, User } from '@prisma/client';
import { InviteMemberDto } from './dto/invite-member.dto';
import { EmailService } from '../email/email.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto, ownerId: string) {
    const organization = await this.prisma.organization.create({
      data: {
        ...createOrganizationDto,
        members: {
          create: {
            userId: ownerId,
            role: 'owner',
            status: 'active',
            joinedAt: new Date(),
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return organization;
  }

  async findAll() {
    return this.prisma.organization.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userId: string,
  ) {
    // Check if user is owner or admin
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: userId,
        role: { in: ['owner', 'admin'] },
        status: 'active',
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update this organization',
      );
    }

    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if user is owner
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: userId,
        role: 'owner',
        status: 'active',
      },
    });

    if (!member) {
      throw new BadRequestException(
        'Only the owner can delete the organization',
      );
    }

    return this.prisma.organization.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async findBySubscriptionId(subscriptionId: string) {
    return this.prisma.organization.findFirst({
      where: { subscriptionId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async updateSubscription(
    id: string,
    subscriptionData: {
      subscriptionId?: string | null;
      subscriptionPlan?: string | null;
      customerId?: string | null;
      maxUsersForSubscription?: number | null;
      freeTrialEndsAt?: Date | null;
      subscriptionStatus?: string | null;
    },
  ) {
    return this.prisma.organization.update({
      where: { id },
      data: subscriptionData,
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async inviteMember(
    organizationId: string,
    inviteMemberDto: InviteMemberDto,
    inviterId: string,
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if inviter is owner or admin
    const inviter = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: inviterId,
        role: { in: ['owner', 'admin'] },
        status: 'active',
      },
    });

    if (!inviter) {
      throw new BadRequestException(
        'You do not have permission to invite members',
      );
    }

    // Check if user is already a member
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: inviteMemberDto.userId,
      },
    });

    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this organization',
      );
    }

    // Check organization's user limit
    const activeMembers = organization.members.filter(
      (m) => m.status === 'active',
    ).length;
    if (
      organization.maxUsersForSubscription &&
      activeMembers >= organization.maxUsersForSubscription
    ) {
      throw new BadRequestException('Organization has reached its user limit');
    }

    // Get inviter's name
    const inviterUser = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    if (!inviterUser) {
      throw new NotFoundException('Inviter not found');
    }

    // Create member invitation
    const member = await this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId: inviteMemberDto.userId,
        role: inviteMemberDto.role || 'member',
      },
      include: {
        user: true,
        organization: true,
      },
    });

    // Send invitation email
    const invitationLink = `${process.env.FRONTEND_URL}/organizations/${organizationId}/invitations/${member.id}`;
    await this.emailService.sendOrganizationInvitation(
      member.user.email,
      organization.name,
      `${inviterUser.firstName} ${inviterUser.lastName}`,
      invitationLink,
    );

    return member;
  }

  async acceptInvitation(
    organizationId: string,
    memberId: string,
    userId: string,
  ) {
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId,
        userId,
        status: 'pending',
      },
    });

    if (!member) {
      throw new NotFoundException('Invitation not found');
    }

    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        status: 'active',
        joinedAt: new Date(),
      },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async rejectInvitation(
    organizationId: string,
    memberId: string,
    userId: string,
  ) {
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId,
        userId,
        status: 'pending',
      },
    });

    if (!member) {
      throw new NotFoundException('Invitation not found');
    }

    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        status: 'rejected',
      },
    });
  }

  async removeMember(organizationId: string, memberId: string, userId: string) {
    // Check if user is owner or admin
    const currentUser = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        role: { in: ['owner', 'admin'] },
        status: 'active',
      },
    });

    if (!currentUser) {
      throw new BadRequestException(
        'You do not have permission to remove members',
      );
    }

    // Check if trying to remove owner
    const targetMember = await this.prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
    });

    if (targetMember?.role === 'owner') {
      throw new BadRequestException('Cannot remove the organization owner');
    }

    return this.prisma.organizationMember.delete({
      where: { id: memberId },
    });
  }

  async getOrganizationMembers(
    organizationId: string,
  ): Promise<OrganizationMember[]> {
    return this.prisma.organizationMember.findMany({
      where: {
        organizationId,
      },
      include: {
        user: true,
      },
    });
  }
}
