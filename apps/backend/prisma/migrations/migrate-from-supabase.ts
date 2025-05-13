import {
  MemberStatus,
  PrismaClient,
  ReminderTarget,
  Role,
} from '@prisma/client';
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

interface Project_Supabase {
  id: number;
  createdAt: string;
  closedAt: string | null;
  isDeleted: boolean;
  organizationId: number;
  assignmentNumber: string;
  publicId: string;
  name: string;
  location: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  companyName: string;
  managerName: string;
  adjusterEmail: string;
  adjusterName: string;
  adjusterPhoneNumber: string;
  insuranceCompanyName: string;
  insuranceClaimId: string;
  lossType: string;
  catCode: string | null;
  humidity: string;
  lastTimeWeatherFetched: string | null;
  temperature: string;
  wind: string;
  lat: string;
  lng: string;
  forecast: string;
  claimSummary: string;
  roofSegments: [];
  roofSpecs: string | null;
  rcvValue: string | null;
  actualValue: string | null;
  status: string;
  projectStatusValueId: string | null;
  damageType: string;
  mainImage: string | null;
  policyNumber: string | null;
  dateOfLoss: string;
}

interface CalendarEvent_Supabase {
  id: number;
  publicId: string;
  createdAt: string;
  updatedAt: string;
  subject: string;
  payload: string;
  projectId: string | null;
  date: string;
  dynamicId: string;
  isDeleted: boolean;
  remindClient: boolean;
  remindProjectOwners: boolean;
  organizationId: string;
  start: string;
  end: string;
  reminderTime: string;
  users: string[];
}

interface CalendarEventReminder_Supabase {
  id: number;
  reminderTarget: string;
  createdAt: string;
  updatedAt: string;
  sendText: boolean;
  sendEmail: boolean;
  textSentAt: string | null;
  emailSentAt: string | null;
  calendarEventId: number;
  date: string;
  phone: string | null;
  email: string | null;
  userId: string | null;
}
const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
async function migrateProjects() {
  console.log('Starting project migration...');

  // Fetch all users from Supabase
  const { data: projects, error } = await supabase
    .from('Project')
    .select('*')
    .eq('isDeleted', false);

  if (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
  console.log('🚀 ~ migrateProjects ~ projects:', projects);

  console.log(`Found ${projects.length} projects to migrate`);

  // Migrate each user
  for (const project of projects as Project_Supabase[]) {
    console.log('🚀 ~ migrateProjects ~ project:', project);
    try {
      await prisma.project.upsert({
        where: { supabaseId: project.publicId },
        update: {
          supabaseId: project.publicId, // Keep as string since that's what Supabase uses
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.createdAt),
          name: project.name,
          description: project.claimSummary,
          adjusterEmail: project.adjusterEmail,
          adjusterName: project.adjusterName,
          adjusterPhoneNumber: project.adjusterPhoneNumber,
          clientEmail: project.clientEmail,
          clientName: project.clientName,
        },
        create: {
          name: project.name,
          description: project.claimSummary,
          adjusterEmail: project.adjusterEmail,
          adjusterName: project.adjusterName,
          adjusterPhoneNumber: project.adjusterPhoneNumber,
          clientEmail: project.clientEmail,
          clientName: project.clientName,
          clientPhoneNumber: project.clientPhoneNumber,
          supabaseId: project.publicId, // Keep as string since that's what Supabase uses
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.createdAt),
        },
      });
      console.log(`Migrated project: ${project.name}`);
    } catch (error) {
      console.error(`Error migrating project ${project.name}:`, error);
    }
  }
}
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

async function migrateCalendarEvents() {
  console.log('Starting calendar events migration...');
  const { data: calendarEvents, error } = await supabase
    .from('CalendarEvent')
    .select('*')
    .eq('isDeleted', false);

  if (error) {
    throw new Error(`Error fetching calendar events: ${error.message}`);
  }

  console.log(`Found ${calendarEvents.length} calendar events to migrate`);

  for (const event of calendarEvents as CalendarEvent_Supabase[]) {
    console.log('🚀 ~ migrateCalendarEvents ~ event:', event);
    const project = await supabase
      .from('Project')
      .select('publicId')
      .eq('isDeleted', false)
      .eq('id', event.projectId)
      .single();
    console.log('🚀 ~ migrateCalendarEvents ~ project:', project);
    try {
      await prisma.calendarEvent.upsert({
        where: { supabaseId: event.id.toString() },
        update: {
          subject: event.subject,
          description: event.payload,
          start: new Date(event.start),
          end: new Date(event.end),
          organization: {
            connect: { supabaseId: event.organizationId },
          },
          project: project.data?.publicId
            ? {
                connect: { supabaseId: project.data?.publicId },
              }
            : undefined,
          usersToRemind: event.users
            ? {
                connect: event.users.map((user) => ({
                  supabaseId: user,
                })),
              }
            : undefined,
        },
        create: {
          supabaseId: event.id.toString(),
          subject: event.subject,
          description: event.payload,
          date: new Date(event.start),
          start: new Date(event.start),
          end: new Date(event.end),
          organization: {
            connect: { supabaseId: event.organizationId },
          },
          project: project.data?.publicId
            ? {
                connect: { supabaseId: project.data?.publicId },
              }
            : undefined,
          usersToRemind: event.users
            ? {
                connect: event.users.map((user) => ({
                  supabaseId: user,
                })),
              }
            : undefined,
        },
      });
    } catch (error) {
      console.error(`Error migrating calendar event ${event.id}:`, error);
    }
  }
}

async function migrateCalendarEventReminders() {
  console.log('Starting calendar event reminders migration...');
  const { data: calendarEventReminders, error } = await supabase
    .from('CalendarEventReminder')
    .select('*');
  // .eq('isDeleted', false);

  if (error) {
    throw new Error(
      `Error fetching calendar event reminders: ${error.message}`,
    );
  }

  console.log(
    `Found ${calendarEventReminders.length} calendar event reminders to migrate`,
  );

  for (const reminder of calendarEventReminders as CalendarEventReminder_Supabase[]) {
    console.log('🚀 ~ migrateCalendarEventReminders ~ reminder:', reminder);
    try {
      await prisma.calendarEventReminder.upsert({
        where: { supabaseId: reminder.id.toString() },
        update: {
          reminderTarget:
            reminder.reminderTarget == 'projectCreator'
              ? ReminderTarget.PROJECT_CREATOR
              : reminder.reminderTarget == 'allAssigned'
                ? ReminderTarget.USERS
                : ReminderTarget.CLIENT,
          sendEmail: reminder.sendEmail,
          sendText: reminder.sendText,
          date: new Date(reminder.date),
          calendarEvent: {
            connect: { supabaseId: reminder.calendarEventId.toString() },
          },
          emailSentAt: reminder.emailSentAt
            ? new Date(reminder.emailSentAt)
            : null,
          textSentAt: reminder.textSentAt
            ? new Date(reminder.textSentAt)
            : null,
          user: reminder.userId
            ? {
                connect: { supabaseId: reminder.userId },
              }
            : undefined,
          createdAt: new Date(reminder.createdAt),
          updatedAt: new Date(reminder.updatedAt),
        },
        create: {
          reminderTarget:
            reminder.reminderTarget == 'projectCreator'
              ? ReminderTarget.PROJECT_CREATOR
              : reminder.reminderTarget == 'allAssigned'
                ? ReminderTarget.USERS
                : ReminderTarget.CLIENT,
          sendEmail: reminder.sendEmail,
          sendText: reminder.sendText,
          date: new Date(reminder.date),
          calendarEvent: {
            connect: { supabaseId: reminder.calendarEventId.toString() },
          },
          emailSentAt: reminder.emailSentAt
            ? new Date(reminder.emailSentAt)
            : null,
          textSentAt: reminder.textSentAt
            ? new Date(reminder.textSentAt)
            : null,
          user: reminder.userId
            ? {
                connect: { supabaseId: reminder.userId },
              }
            : undefined,
          createdAt: new Date(reminder.createdAt),
          updatedAt: new Date(reminder.updatedAt),
        },
      });
    } catch (error) {
      console.error(
        `Error migrating calendar event reminder ${reminder.id}:`,
        error,
      );
    }
  }
}

async function main() {
  try {
    console.log('Starting migration from Supabase...');

    // Run migrations in sequence
    // await migrateUsers();
    // await migrateOrganizations();
    // await migrateOrganizationMemberships();
    // await migrateProjects();
    await migrateCalendarEvents();
    await migrateCalendarEventReminders();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
