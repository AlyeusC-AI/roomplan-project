import {
  LossType,
  MemberStatus,
  PrismaClient,
  ReminderTarget,
  Role,
} from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Database } from '../../src/types/database';
import ImageKit from 'imagekit';
const supabaseUrlForImages =
  'https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/media/';

dotenv.config();

interface AreaAffected_Supabase {
  id: number;
  createdAt: string;
  date: string;
  roomId: number;
  material: string | null;
  totalAreaRemoved: string | null;
  totalAreaMicrobialApplied: string | null;
  cause: string | null;
  category: number | null;
  cabinetryRemoved: string | null;
  isDeleted: boolean;
  publicId: string;
  projectId: number;
  type: string;
  measurementType: string | null;
  extraFields: any | null;
}

interface Room_Supabase {
  id: number;
  createdAt: string;
  isDeleted: boolean;
  publicId: string;
  name: string;
  projectId: number;
  gpp: string | null;
  humidity: string | null;
  dehuReading: string | null;
  temperature: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  totalSqft: string | null;
  windows: number | null;
  doors: number | null;
  equipmentUsed: string[];
  wallName: string | null;
  floorName: string | null;
  extendedWalls: any | null;
  roomPlanSVG: string | null;
  scannedFileKey: string | null;
  cubiTicketId: string | null;
  cubiModelId: string | null;
  cubiRoomPlan: string | null;
  equipmentUsedQuantity: any | null;
  AreaAffected: AreaAffected_Supabase[];
  Project: { publicId: string };
}
interface RoomReading_Supabase {
  id: number;
  createdAt: string;
  date: string;
  humidity: string | null;
  temperature: string | null;
  moistureContentWall: string;
  moistureContentFloor: string;
  equipmentUsed: string[];
  roomId: number;
  isDeleted: boolean;
  publicId: string;
  projectId: number;
  gpp: string | null;
  wallName: string | null;
  floorName: string | null;
  extendedWalls: {
    id: string;
    name: string;
    type: string;
    value: string;
  }[];
  RoomReadingImage: {
    id: number;
    type: 'wall' | 'floor';
    imageKey: string;
    created_at: string;
    RoomReadingId: number;
  }[];
  GenericRoomReading: {
    id: number;
    gpp: string;
    type: string;
    value: string;
    humidity: string;
    publicId: string;
    createdAt: string;
    isDeleted: boolean;
    temperature: string;
    roomReadingId: number;
  }[];
  Room: { publicId: string };
  Project: { publicId: string };
}

interface Note_Supabase {
  id: number;
  createdAt: string;
  updatedAt: string | null;
  date: string;
  roomId: number;
  isDeleted: boolean;
  publicId: string;
  projectId: number;
  body: string;
  Room: { publicId: string };
  Project: { publicId: string };
  User: { publicId: string };
  NoteImage: {
    id: number;
    imageKey: string;
  }[];
}

interface Inference_Supabase {
  id: number;
  createdAt: string;
  isDeleted: boolean;
  publicId: string;
  imageId: number;
  imageKey: string;
  projectId: number;
  Image: {
    id: number;
    key: string;
    includeInReport: boolean;
    order: number;
    Project: { publicId: string };
    Room: { publicId: string };
  };
}

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

interface Image_Supabase {
  id: number;
  createdAt: string;
  isDeleted: boolean;
  publicId: string;
  key: string;
  projectId: number;
  organizationId: number;
  includeInReport: boolean;
  description: string | null;
  order: number | null;
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
  // await prisma.project.deleteMany();
  // Migrate each user
  for (const project of projects as Project_Supabase[]) {
    console.log('🚀 ~ migrateProjects ~ project:', project);
    try {
      const { data: organization } = await supabase
        .from('Organization')
        .select('publicId')
        .eq('id', project.organizationId)
        .single();

      let statusId: string | null = null;

      const status = await prisma.projectStatus.findFirst({
        where: {
          label: project.status,
          organization: {
            supabaseId: organization?.publicId,
          },
        },
      });

      if (status) {
        statusId = status.id;
      } else {
        const newStatus = await prisma.projectStatus.create({
          data: {
            label: project.status,
            organization: {
              connect: { supabaseId: organization?.publicId },
            },
          },
        });
        statusId = newStatus.id;
      }

      const getLossType = (lossType: string) => {
        switch (lossType) {
          case 'fire':
            return LossType.FIRE;
          case 'water':
            return LossType.WATER;
          case 'wind':
            return LossType.WIND;
          case 'hail':
            return LossType.HAIL;
          case 'mold':
            return LossType.MOLD;
          default:
            return LossType.OTHER;
        }
      };

      const lossType = getLossType(project.lossType || project.damageType);

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
          clientPhoneNumber: project.clientPhoneNumber,
          companyName: project.companyName,
          managerName: project.managerName,
          insuranceCompanyName: project.insuranceCompanyName,
          insuranceClaimId: project.insuranceClaimId,
          lossType,
          catCode: project.catCode,
          humidity: project.humidity,
          temperature: project.temperature,
          wind: project.wind,
          lat: project.lat,
          lng: project.lng,
          forecast: project.forecast,
          claimSummary: project.claimSummary,
          roofSegments: project.roofSegments,
          roofSpecs: project.roofSpecs,
          rcvValue: project.rcvValue,
          actualValue: project.actualValue,
          status: {
            connect: { id: statusId },
          },
          // damageType: project.damageType,
          mainImage: project.mainImage,
          policyNumber: project.policyNumber,
          dateOfLoss: project.dateOfLoss,
          closedAt: project.closedAt,
          assignmentNumber: project.assignmentNumber,
          location: project.location,
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

          companyName: project.companyName,
          managerName: project.managerName,
          insuranceCompanyName: project.insuranceCompanyName,
          insuranceClaimId: project.insuranceClaimId,
          lossType,
          catCode: project.catCode,
          humidity: project.humidity,
          temperature: project.temperature,
          wind: project.wind,
          lat: project.lat,
          lng: project.lng,
          forecast: project.forecast,
          claimSummary: project.claimSummary,
          roofSegments: project.roofSegments,
          roofSpecs: project.roofSpecs,
          rcvValue: project.rcvValue,
          actualValue: project.actualValue,
          status: {
            connect: { id: statusId },
          },
          // damageType: project.damageType,
          mainImage: project.mainImage,
          policyNumber: project.policyNumber,
          dateOfLoss: project.dateOfLoss,
          closedAt: project.closedAt,
          assignmentNumber: project.assignmentNumber,
          location: project.location,
          organization: {
            connect: { supabaseId: organization?.publicId },
          },
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
            create: projectStatuses.map(
              (status: ProjectStatus_Supabase, index: number) => ({
                label: status.label,
                color: status.color,
                order: status.order,
                description: status.description,
                isDefault: index === 0,
              }),
            ),
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
            create: projectStatuses.map(
              (status: ProjectStatus_Supabase, index: number) => ({
                label: status.label,
                color: status.color,
                order: status.order,
                description: status.description,
                isDefault: index === 0,
              }),
            ),
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

async function uploadImage(blob: Blob) {
  const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
  });

  const file = await blob.arrayBuffer();
  const result = await imagekit.upload({
    file: Buffer.from(file),
    fileName: `migrated_${Date.now()}.jpg`,
    folder: 'migrated',
  });

  return result.url;
}

async function migrateInferences() {
  console.log('Starting inferences migration...');
  const { data: inferences, error } = await supabase
    .from('Inference')
    .select(
      '* , Image(id, key, includeInReport, order, Project(publicId), Room(publicId))',
    )
    .eq('isDeleted', false);
  if (error) {
    throw new Error(`Error fetching inferences: ${error.message}`);
  }
  console.log(`Found ${inferences.length} inferences to migrate`);
  for (const inference of inferences as Inference_Supabase[]) {
    console.log('🚀 ~ migrateInferences ~ inference:', inference);
    const image = inference.Image;
    // const image = await supabase
    //   .from('Image')
    //   .select('* , Project(publicId)')
    //   .eq('isDeleted', false)
    //   .eq('id', inference.imageId)
    //   .single();
    if (!image) {
      console.error(`Image ${inference.imageId} not found`);
      continue;
    }
    console.log('🚀 ~ migrateInferences ~ image:', image);
    let imageUrl = image.key;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `${supabaseUrlForImages}${image.key}`;
      const imageData = await fetch(imageUrl);
      const blob = await imageData.blob();
      imageUrl = await uploadImage(blob);
      console.log('🚀 ~ migrateImages ~ optimizedImageUrl:', imageUrl);
    }
    console.log('🚀 ~ migrateInferences ~ imageUrl:', imageUrl);
    try {
      await prisma.image.upsert({
        where: { supabaseId: image.id.toString() },
        update: {
          url: imageUrl,
          type: 'ROOM',
          supabaseId: image.id.toString(),
          project: {
            connect: { supabaseId: image.Project.publicId },
          },
        },
        create: {
          url: imageUrl,
          supabaseId: image.id.toString(),
          type: 'ROOM',
          project: {
            connect: { supabaseId: image.Project.publicId },
          },
          order: image.order || undefined,
          showInReport: image.includeInReport || false,
          room: {
            connect: { supabaseId: image.Room.publicId },
          },
        },
      });
    } catch (error) {
      console.error(`Error migrating inference ${inference.id}:`, error);
    }
  }
}

async function migrateNotes() {
  console.log('Starting notes migration...');
  const { data: notes, error } = await supabase
    .from('Notes')
    .select('* , NoteImage(id, imageKey), Room(publicId), Project(publicId)')
    .eq('isDeleted', false)
    .neq('body', '');

  if (error) {
    throw new Error(`Error fetching notes: ${error.message}`);
  }
  console.log(`Found ${notes.length} notes to migrate`);
  for (const note of notes as Note_Supabase[]) {
    console.log('🚀 ~ migrateNotes ~ note:', note);
    try {
      let images: string[] = [];
      for (const image of note.NoteImage) {
        if (!image.imageKey) {
          continue;
        }
        if (image.imageKey.startsWith('http')) {
          images.push(image.imageKey);
        } else {
          const imageUrl = `${supabaseUrlForImages}${image.imageKey}`;
          const imageData = await fetch(imageUrl);
          const blob = await imageData.blob();
          const optimizedImageUrl = await uploadImage(blob);
          images.push(optimizedImageUrl);
        }
      }

      await prisma.note.upsert({
        where: { supabaseId: note.id.toString() },
        update: {
          body: note.body,
          images: {
            deleteMany: {},
            create: images.map((image) => ({
              url: image,
              type: 'NOTE',
              project: {
                connect: { supabaseId: note.Project.publicId },
              },
            })),
          },
        },
        create: {
          body: note.body,
          room: {
            connect: { supabaseId: note.Room.publicId },
          },
          images: {
            create: images.map((image) => ({
              url: image,
              type: 'NOTE',
              project: {
                connect: { supabaseId: note.Project.publicId },
              },
            })),
          },
        },
      });
    } catch (error) {
      console.error(`Error migrating note ${note.id}:`, error);
    }
  }
}

async function migrateReading() {
  console.log('Starting reading migration...');
  const { data: readings, error } = await supabase
    .from('RoomReading')
    .select(
      '* , RoomReadingImage(*),GenericRoomReading(*), Room(publicId), Project(publicId)',
    )
    .eq('isDeleted', false);

  if (error) {
    throw new Error(`Error fetching readings: ${error.message}`);
  }
  console.log(`Found ${readings.length} readings to migrate`);
  await prisma.roomReading.deleteMany();
  for (const reading of readings as RoomReading_Supabase[]) {
    console.log('🚀 ~ migrateReading ~ reading:', reading);
    const room = await prisma.room.findUnique({
      where: { supabaseId: reading.Room.publicId },
    });
    if (!room) {
      console.error(`Room ${reading.Room.publicId} not found`);
      continue;
    }
    const project = await prisma.project.findUnique({
      where: { supabaseId: reading.Project.publicId },
    });
    if (!project) {
      console.error(`Project ${reading.Project.publicId} not found`);
      continue;
    }

    const roomReading = await prisma.roomReading.create({
      data: {
        room: {
          connect: { id: room.id },
        },
        date: new Date(reading.date),
        humidity: reading.humidity ? parseFloat(reading.humidity) : 0,
        temperature: reading.temperature ? parseFloat(reading.temperature) : 0,
        // gpp: reading.gpp ? parseFloat(reading.gpp) : 0,
        // equipmentUsed: reading.equipmentUsed,
        genericRoomReading: {
          create: reading.GenericRoomReading.map((reading) => ({
            gpp: reading.gpp ? parseFloat(reading.gpp) : 0,
            value: reading.value,
            humidity: reading.humidity ? parseFloat(reading.humidity) : 0,
            temperature: reading.temperature
              ? parseFloat(reading.temperature)
              : 0,
          })),
        },
        wallReadings: {
          create: reading.extendedWalls.map((wall) => ({
            type: wall.type,
            value: wall.value,
            roomReading: {
              connect: { id: roomReading.id },
            },
          })),
        },
      },
    });
  }
}

async function migrateRooms() {
  console.log('Starting rooms migration...');
  const { data: rooms, error } = await supabase
    .from('Room')
    .select('* , AreaAffected(*), Project(publicId) ')
    .eq('isDeleted', false);

  if (error) {
    throw new Error(`Error fetching rooms: ${error.message}`);
  }
  console.log(`Found ${rooms.length} rooms to migrate`);
  await prisma.areaAffected.deleteMany();
  await prisma.room.deleteMany();
  for (const room of rooms as Room_Supabase[]) {
    console.log('🚀 ~ migrateRooms ~ room:', room);
    try {
      // await prisma.room.upsert({
      //   where: { supabaseId: room.publicId },
      //   update: {
      //     name: room.name,
      //     project: {
      //       connect: { supabaseId: room.Project.publicId },
      //     },
      //   },
      //   create: {
      //     name: room.name,
      //     project: {
      //       connect: { supabaseId: room.Project.publicId },
      //     },
      //   },
      // });
      const ceilingAffected = room.AreaAffected.find(
        (area) => area.type === 'ceiling',
      );
      const wallsAffected = room.AreaAffected.find(
        (area) => area.type === 'wall',
      );
      const floorAffected = room.AreaAffected.find(
        (area) => area.type === 'floor',
      );
      await prisma.room.create({
        data: {
          name: room.name,
          project: { connect: { supabaseId: room.Project.publicId } },
          cubiRoomPlan: room.cubiRoomPlan,
          cubiTicketId: room.cubiTicketId,
          cubiModelId: room.cubiModelId,
          scannedFileKey: room.scannedFileKey,
          roomPlanSVG: room.roomPlanSVG,
          humidity: room.humidity ? parseFloat(room.humidity) : 0,
          dehuReading: room.dehuReading ? parseFloat(room.dehuReading) : 0,
          temperature: room.temperature ? parseFloat(room.temperature) : 0,
          length: room.length ? parseFloat(room.length) : 0,
          width: room.width ? parseFloat(room.width) : 0,
          height: room.height ? parseFloat(room.height) : 0,
          totalSqft: room.totalSqft ? parseFloat(room.totalSqft) : 0,
          windows: room.windows,
          doors: room.doors,
          ceilingAffected: {
            create: ceilingAffected
              ? {
                  material: ceilingAffected.material,
                  totalAreaRemoved: ceilingAffected.totalAreaRemoved,
                  totalAreaMicrobialApplied:
                    ceilingAffected.totalAreaMicrobialApplied,
                  isVisible: !ceilingAffected.isDeleted,
                }
              : undefined,
          },
          wallsAffected: {
            create: wallsAffected
              ? {
                  material: wallsAffected.material,
                  totalAreaRemoved: wallsAffected.totalAreaRemoved,
                  totalAreaMicrobialApplied:
                    wallsAffected.totalAreaMicrobialApplied,
                  isVisible: !wallsAffected.isDeleted,
                }
              : undefined,
          },
          floorAffected: {
            create: floorAffected
              ? {
                  material: floorAffected.material,
                  totalAreaRemoved: floorAffected.totalAreaRemoved,
                  totalAreaMicrobialApplied:
                    floorAffected.totalAreaMicrobialApplied,
                  isVisible: !floorAffected.isDeleted,
                }
              : undefined,
          },
          // equipmentsUsed: {
          //   create: room.equipmentUsed.map((equipment) => ({
          //     equipment: { connect: { supabaseId: equipment } },
          //     quantity: 1,
          //     project: { connect: { supabaseId: room.Project.publicId } },

          //   })),
          // },
        },
      });
    } catch (error) {
      console.error(`Error migrating room ${room.id}:`, error);
    }
  }
}

interface Document_Supabase {
  id: number;
  createdAt: string;
  publicId: string;
  name: string;
  projectId: number;
  type: string;
  json: any;
  Project: { publicId: string };
}
async function migrateDocuments() {
  console.log('Starting documents migration...');
  const { data: documents, error } = await supabase
    .from('Document')
    .select('* , Project(publicId) ');

  if (error) {
    throw new Error(`Error fetching documents: ${error.message}`);
  }
  console.log(`Found ${documents.length} documents to migrate`);
  for (const document of documents as Document_Supabase[]) {
    console.log('🚀 ~ migrateDocuments ~ document:', document);
    await prisma.document.create({
      data: {
        name: document.name,
        project: { connect: { supabaseId: document.Project.publicId } },
        type: document.json.type == 'cos' ? 'COS' : 'AUTH',
        json: document.json,
      },
    });
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
    // await migrateCalendarEvents();
    // await migrateCalendarEventReminders();
    // await migrateRooms();
    // await migrateNotes();
    // await migrateReading();

    // await migrateInferences();
    await migrateDocuments();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
