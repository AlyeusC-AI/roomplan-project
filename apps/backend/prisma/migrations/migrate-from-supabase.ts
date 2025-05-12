import { MemberStatus, PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Database } from '../../src/types/database';

dotenv.config();

interface User_Supabase {
  id: string;
  token: string | null;
  createdAt: string;
  email: string;
  isDeleted: boolean;
  updatedAt: string;
  firstName: string;
  lastName: string;
  phone: string;
  inviteId: string | null;
  isSupportUser: boolean;
  hasSeenProductTour: boolean;
  productTourData: string | null;
  savedDashboardView: string;
  photoView: string;
  groupView: string;
  onboardingStatus: null;
  organizationId: string;
  accessLevel: string;
  removed: boolean;
}

interface Organization_Supabase {
  id: number;
  publicId: string;
  createdAt: string;
  name: string;
  address: string | null;
  faxNumber: string | null;
  size: string | null;
  isDeleted: boolean;
  updatedAt: string;
  logoId: string | null;
  lat: number | null;
  lng: number | null;
  owner: string;
  subscriptionId: string | null;
  maxUsersForSubscription: number | null;
  stripeSessionId: string | null;
  customerId: string | null;
  freeTrialEndsAt: string | null;
  subscriptionPlan: string | null;
  phoneNumber: string | null;
  extraEquipemnts: string | null;
  subscriptionStatus: string | null;
}

interface Equipment_Supabase {
  id: number;
  publicId: string;
  createdAt: string;
  isDeleted: boolean;
  name: string;
  quantity: number;
  organizationId: number;
}

interface ProjectStatus_Supabase {
  id: number;
  createdAt: string;
  isDeleted: boolean;
  publicId: string;
  label: string;
  description: string;
  color: string;
  order: number;
  organizationId: number;
}

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function migrateUsers() {
  console.log('Starting user migration...');

  // Fetch all users from Supabase
  const { data: users, error } = await supabase
    .from('User')
    .select('*')
    .eq('isDeleted', false);

  if (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
  console.log('🚀 ~ migrateUsers ~ users:', users);

  console.log(`Found ${users.length} users to migrate`);

  // Migrate each user
  for (const user of users as User_Supabase[]) {
    console.log('🚀 ~ migrateUsers ~ user:', user);
    try {
      await prisma.user.upsert({
        where: { supabaseId: user.id },
        update: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || null,
          password: '', // You'll need to handle password migration separately
          supabaseId: user.id, // Keep as string since that's what Supabase uses
          isEmailVerified: true, // Assuming verified users in Supabase
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          avatar: `https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/profile-pictures/${user.id}/avatar.png`,
          acceptReminders: true,
        },
        create: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || null,
          password: '', // You'll need to handle password migration separately
          supabaseId: user.id, // Keep as string since that's what Supabase uses
          isEmailVerified: true, // Assuming verified users in Supabase
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          avatar: `https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/profile-pictures/${user.id}/avatar.png`,
          acceptReminders: true,
        },
      });
      console.log(`Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`Error migrating user ${user.email}:`, error);
    }
  }
}

async function migrateOrganizations() {
  console.log('Starting organization migration...');

  // Fetch all organizations from Supabase
  const { data: organizations, error } = await supabase
    .from('Organization')
    .select('*')
    .eq('isDeleted', false);

  if (error) {
    throw new Error(`Error fetching organizations: ${error.message}`);
  }

  console.log(`Found ${organizations.length} organizations to migrate`);

  // Migrate each organization
  for (const org of organizations as Organization_Supabase[]) {
    const { data: projectStatuses, error: projectStatusesError } =
      await supabase
        .from('ProjectStatusValue')
        .select('*')
        .eq('organizationId', org.id);

    if (projectStatusesError) {
      throw new Error(
        `Error fetching project statuses: ${projectStatusesError.message}`,
      );
    }
    console.log(
      '🚀 ~ migrateOrganizations ~ projectStatuses:',
      projectStatuses,
    );
    const { data: equipment, error: equipmentError } = await supabase
      .from('Equipment')
      .select('*')
      .eq('isDeleted', false);

    console.log('🚀 ~ migrateOrganizations ~ org:', org);
    try {
      await prisma.organization.upsert({
        where: { supabaseId: org.publicId },
        update: {
          supabaseId: org.publicId,
          name: org.name,
          phoneNumber: org.phoneNumber || null,
          address: org.address || null,

          faxNumber: org.faxNumber || null,
          size: org.size ? parseInt(org.size) : null,
          isDeleted: org.isDeleted || false,
          logo: org.logoId || null,
          lat: org.lat || null,
          lng: org.lng || null,
          subscriptionId: org.subscriptionId || null,
          subscriptionPlan: org.subscriptionPlan || null,
          customerId: org.customerId || null,
          maxUsersForSubscription: org.maxUsersForSubscription || 0,
          freeTrialEndsAt: org.freeTrialEndsAt
            ? new Date(org.freeTrialEndsAt)
            : null,
          subscriptionStatus: org.subscriptionStatus || null,
          createdAt: new Date(org.createdAt),
          updatedAt: new Date(org.updatedAt),
          projectStatuses: {
            deleteMany: {},
            create: projectStatuses.map((status: ProjectStatus_Supabase) => ({
              label: status.label,
              color: status.color,
              order: status.order,
              description: status.description,
            })),
          },
          equipments: {
            deleteMany: {},
            create:
              equipment?.map((equipment: Equipment_Supabase) => ({
                name: equipment.name,
                quantity: equipment.quantity,
              })) || [],
          },
        },
        create: {
          projectStatuses: {
            create: projectStatuses.map((status: ProjectStatus_Supabase) => ({
              label: status.label,
              color: status.color,
              order: status.order,
              description: status.description,
            })),
          },
          equipments: {
            create:
              equipment?.map((equipment: Equipment_Supabase) => ({
                name: equipment.name,
                quantity: equipment.quantity,
              })) || [],
          },
          supabaseId: org.publicId,
          name: org.name,
          phoneNumber: org.phoneNumber || null,
          address: org.address || null,
          faxNumber: org.faxNumber || null,
          size: org.size ? parseInt(org.size) : null,
          isDeleted: org.isDeleted || false,
          logo: org.logoId || null,
          lat: org.lat || null,
          lng: org.lng || null,
          subscriptionId: org.subscriptionId || null,
          subscriptionPlan: org.subscriptionPlan || null,
          customerId: org.customerId || null,
          maxUsersForSubscription: org.maxUsersForSubscription || 0,
          freeTrialEndsAt: org.freeTrialEndsAt
            ? new Date(org.freeTrialEndsAt)
            : null,
          subscriptionStatus: org.subscriptionStatus || null,
          createdAt: new Date(org.createdAt),
          updatedAt: new Date(org.updatedAt),
        },
      });
      console.log(`Migrated organization: ${org.name}`);
    } catch (error) {
      console.error(`Error migrating organization ${org.name}:`, error);
    }
  }
}

async function migrateOrganizationMemberships() {
  console.log('Starting organization memberships migration...');

  // Fetch all organization memberships from Supabase
  const { data: memberships, error } = await supabase
    .from('UserToOrganization')
    .select('*, User(*), Organization(*)')
    .eq('isDeleted', false);

  if (error) {
    throw new Error(`Error fetching memberships: ${error.message}`);
  }

  console.log(`Found ${memberships.length} memberships to migrate`);

  //   Migrate each membership
  for (const membership of memberships) {
    try {
      // Get the new user ID from the supabaseId
      const user = await prisma.user.findFirst({
        where: { supabaseId: membership.User.id },
      });

      // Get the new organization ID
      const org = await prisma.organization.findFirst({
        where: { supabaseId: membership.Organization.publicId },
      });

      if (!user || !org) {
        console.error(
          `Could not find user or organization for membership: ${membership.id}`,
        );
        continue;
      }

      await prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: org.id,
            userId: user.id,
          },
        },
        create: {
          organization: {
            connect: { supabaseId: membership.Organization.publicId },
          },
          user: { connect: { supabaseId: membership.User.id } },
          role: membership.role || Role.MEMBER,
          status: MemberStatus.ACTIVE, // Assuming active members in Supabase
          invitedAt: new Date(membership.createdAt),
          joinedAt: new Date(membership.createdAt),
          createdAt: new Date(membership.createdAt),
          updatedAt: new Date(membership.createdAt),
        },
        update: {
          organization: {
            connect: { supabaseId: membership.Organization.publicId },
          },
          user: { connect: { supabaseId: membership.User.id } },
          role: membership.role || Role.MEMBER,
          status: MemberStatus.ACTIVE, // Assuming active members in Supabase
        },
      });
      console.log(
        `Migrated membership for user ${membership.userId} in organization ${membership.organizationId}`,
      );
    } catch (error) {
      console.error(`Error migrating membership ${membership.id}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('Starting migration from Supabase...');

    // Run migrations in sequence
    // await migrateUsers();
    await migrateOrganizations();
    // await migrateOrganizationMemberships();

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
