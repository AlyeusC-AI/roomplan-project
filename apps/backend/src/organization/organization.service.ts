import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Organization,
  Prisma,
  OrganizationMember,
  User,
  Role,
  MemberStatus,
} from '@prisma/client';
import { InviteMemberDto } from './dto/invite-member.dto';
import { EmailService } from '../email/email.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto, ownerId: string) {
    const organization = await this.prisma.organization.create({
      data: {
        ...createOrganizationDto,
        projectStatuses: {
          create: [
            {
              label: 'Active',
              color: '#000000',
              isDefault: true,
            },
            {
              label: 'Completed',
              color: '#000000',
              isDefault: false,
            },
            {
              label: 'On Hold',
              color: '#000000',
              isDefault: false,
            },
            {
              label: 'Cancelled',
              color: '#000000',
              isDefault: false,
            },
          ],
        },
        members: {
          create: {
            user: {
              connect: {
                id: ownerId,
              },
            },
            role: Role.OWNER,
            status: MemberStatus.ACTIVE,
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

    // Create default equipment categories
    await this.prisma.equipmentCategory.createMany({
      data: [
        {
          name: 'Dehumidifiers',
          organizationId: organization.id,
          isDefault: true,
        },
        {
          name: 'Air Movers',
          organizationId: organization.id,
          isDefault: true,
        },
        {
          name: 'Air Scrubbers',
          organizationId: organization.id,
          isDefault: true,
        },
      ],
      skipDuplicates: true,
    });

    return organization;
  }

  async findAll(user: any) {
    console.log('🚀 ~ OrganizationService ~ findAll ~ user:', user);
    return this.prisma.organization.findMany({
      where: {
        isDeleted: false,
        members: {
          some: {
            userId: user.userId,
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
        // role: { in: ['owner', 'admin'] },
        status: MemberStatus.ACTIVE,
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
        role: Role.OWNER,
        status: MemberStatus.ACTIVE,
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
        role: { in: [Role.OWNER, Role.ADMIN] },
        status: MemberStatus.ACTIVE,
      },
    });

    if (!inviter) {
      throw new BadRequestException(
        'You do not have permission to invite members',
      );
    }

    // Check organization's user limit
    const activeMembers = organization.members.filter(
      (m) => m.status === MemberStatus.ACTIVE,
    ).length;
    // if (
    //   organization.maxUsersForSubscription &&
    //   activeMembers >= organization.maxUsersForSubscription
    // ) {
    //   throw new BadRequestException('Organization has reached its user limit');
    // }

    // Get inviter's name
    const inviterUser = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    if (!inviterUser) {
      throw new NotFoundException('Inviter not found');
    }

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email: inviteMemberDto.email },
    });

    // If user doesn't exist, create a temporary user
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: inviteMemberDto.email,
          firstName: inviteMemberDto.firstName || '',
          lastName: inviteMemberDto.lastName || '',
          password: '', // Temporary password, user will need to set a real password during registration
          isEmailVerified: true,
        },
      });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Check if user is already a member
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: user.id,
      },
    });

    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this organization',
      );
    }

    // Create member invitation
    const member = await this.prisma.organizationMember.create({
      data: {
        organization: {
          connect: {
            id: organizationId,
          },
        },
        role: inviteMemberDto.role || Role.MEMBER,
        status: MemberStatus.PENDING,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        user: true,
        organization: true,
      },
    });
    const token = this.jwtService.sign({
      sub: member.user.id,
      email: member.user.email,
    });

    // Send invitation email
    const invitationLink = `${process.env.FRONTEND_URL}/acceptInvite?token=${token}&orgId=${organizationId}`;
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
    userData?: {
      firstName?: string;
      lastName?: string;
      password?: string;
      phone?: string;
    },
  ) {
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId,
        userId,
        status: MemberStatus.PENDING,
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Invitation not found');
    }

    // If user data is provided, update the user
    if (userData) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: hashedPassword,
          phone: userData.phone,
          isEmailVerified: true,
        },
      });
    }
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    await this.prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user,
    };
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
        status: MemberStatus.PENDING,
      },
    });

    if (!member) {
      throw new NotFoundException('Invitation not found');
    }

    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        status: MemberStatus.REJECTED,
      },
    });
  }

  async resendInvitation(
    organizationId: string,
    memberId: string,
    inviterId: string,
  ) {
    // Check if inviter is owner or admin
    const inviter = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: inviterId,
        role: { in: [Role.OWNER, Role.ADMIN] },
        status: MemberStatus.ACTIVE,
      },
    });

    if (!inviter) {
      throw new BadRequestException(
        'You do not have permission to resend invitations',
      );
    }

    const member = await this.prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId,
        status: MemberStatus.PENDING,
      },
      include: {
        user: true,
        organization: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Invitation not found');
    }

    // Get inviter's name
    const inviterUser = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    if (!inviterUser) {
      throw new NotFoundException('Inviter not found');
    }
    const token = this.jwtService.sign({
      sub: member.user.id,
      email: member.user.email,
    });

    // Send invitation email
    const invitationLink = `${process.env.FRONTEND_URL}/acceptInvite?token=${token}&orgId=${organizationId}`;
    await this.emailService.sendOrganizationInvitation(
      member.user.email,
      member.organization.name,
      `${inviterUser.firstName} ${inviterUser.lastName}`,
      invitationLink,
    );

    return member;
  }

  async removeMember(organizationId: string, memberId: string, userId: string) {
    // Check if user is owner or admin
    const currentUser = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        role: { in: [Role.OWNER, Role.ADMIN] },
        status: MemberStatus.ACTIVE,
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

    if (targetMember?.role === Role.OWNER) {
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

  async updateMember(
    organizationId: string,
    memberId: string,
    data: { role: string },
    userId: string,
  ) {
    // Check if user is owner or admin
    const currentUser = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        role: { in: [Role.OWNER, Role.ADMIN] },
        status: MemberStatus.ACTIVE,
      },
    });

    if (!currentUser) {
      throw new BadRequestException(
        'You do not have permission to update member roles',
      );
    }

    // Check if trying to update owner
    const targetMember = await this.prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
    });

    if (targetMember?.role === Role.OWNER) {
      throw new BadRequestException(
        'Cannot update the organization owner role',
      );
    }

    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: data.role as Role },
      include: {
        user: true,
      },
    });
  }
}
