-- CreateEnum
CREATE TYPE "DashboardViews" AS ENUM ('listView', 'boardView', 'mapView');

-- CreateEnum
CREATE TYPE "SavedOptionType" AS ENUM ('carrier', 'wallMaterial', 'floorMaterial');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('admin', 'viewer', 'projectManager', 'accountManager', 'contractor');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'mitigation', 'inspection', 'review', 'completed', 'inactive', 'incomplete');

-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('subcontractor', 'miscellaneous', 'materials', 'labor');

-- CreateEnum
CREATE TYPE "RoomReadingType" AS ENUM ('dehumidifer');

-- CreateEnum
CREATE TYPE "NotesAuditAction" AS ENUM ('updated', 'deleted', 'created');

-- CreateEnum
CREATE TYPE "AreaAffectedType" AS ENUM ('wall', 'ceiling', 'floor');

-- CreateEnum
CREATE TYPE "DimensionUnit" AS ENUM ('sf', 'lf', 'ea');

-- CreateEnum
CREATE TYPE "ReminderTarget" AS ENUM ('client', 'allAssigned', 'projectCreator');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('one_time', 'recurring');

-- CreateEnum
CREATE TYPE "PricingPlanInterval" AS ENUM ('day', 'week', 'month', 'year');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "inviteId" TEXT,
    "isSupportUser" BOOLEAN NOT NULL DEFAULT false,
    "hasSeenProductTour" BOOLEAN NOT NULL DEFAULT false,
    "savedDashboardView" "DashboardViews" NOT NULL DEFAULT 'listView',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "faxNumber" TEXT NOT NULL DEFAULT '',
    "size" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoId" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSavedOption" (
    "id" SERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "type" "SavedOptionType" NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "OrganizationSavedOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToOrganization" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" INTEGER NOT NULL,
    "role" TEXT,
    "accessLevel" "AccessLevel" DEFAULT 'viewer',
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserToOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationInvitation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToProject" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "UserToProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" INTEGER NOT NULL,
    "assignmentNumber" TEXT NOT NULL DEFAULT '',
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "clientName" TEXT NOT NULL DEFAULT '',
    "clientEmail" TEXT NOT NULL DEFAULT '',
    "clientPhoneNumber" TEXT NOT NULL DEFAULT '',
    "companyName" TEXT NOT NULL DEFAULT '',
    "managerName" TEXT NOT NULL DEFAULT '',
    "adjusterEmail" TEXT NOT NULL DEFAULT '',
    "adjusterName" TEXT NOT NULL DEFAULT '',
    "adjusterPhoneNumber" TEXT NOT NULL DEFAULT '',
    "insuranceCompanyName" TEXT NOT NULL DEFAULT '',
    "insuranceClaimId" TEXT NOT NULL DEFAULT '',
    "lossType" TEXT NOT NULL DEFAULT '',
    "catCode" INTEGER,
    "humidity" TEXT NOT NULL DEFAULT '',
    "lastTimeWeatherFetched" TIMESTAMP(3),
    "temperature" TEXT NOT NULL DEFAULT '',
    "lat" TEXT NOT NULL DEFAULT '',
    "lng" TEXT NOT NULL DEFAULT '',
    "forecast" TEXT NOT NULL DEFAULT '',
    "claimSummary" TEXT NOT NULL DEFAULT '',
    "roofSegments" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "roofSpecs" JSONB,
    "rcvValue" DOUBLE PRECISION,
    "actualValue" DOUBLE PRECISION,
    "status" "ProjectStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cost" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "name" TEXT,
    "projectId" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "type" "CostType" NOT NULL,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyData" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" INTEGER,
    "bathrooms" DOUBLE PRECISION,
    "bedrooms" INTEGER,
    "squareFootage" INTEGER,
    "realtyMoleId" TEXT,
    "data" JSONB,

    CONSTRAINT "PropertyData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataDeletionRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DataDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoAccessLink" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "accessId" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "PhotoAccessLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "organizationId" INTEGER,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inference" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT NOT NULL,
    "imageId" INTEGER,
    "imageKey" TEXT,
    "projectId" INTEGER NOT NULL,
    "roomId" INTEGER,

    CONSTRAINT "Inference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "gpp" TEXT,
    "humidity" TEXT,
    "dehuReading" TEXT,
    "temperature" TEXT,
    "length" TEXT,
    "width" TEXT,
    "height" TEXT,
    "totalSqft" TEXT,
    "windows" INTEGER,
    "doors" INTEGER,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomReading" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "humidity" TEXT,
    "temperature" TEXT,
    "roomId" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "RoomReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotesAuditTrail" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notesId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "action" "NotesAuditAction" NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "NotesAuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaAffected" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" INTEGER NOT NULL,
    "material" TEXT,
    "totalAreaRemoved" TEXT,
    "totalAreaMicrobialApplied" TEXT,
    "cause" TEXT,
    "category" INTEGER,
    "cabinetryRemoved" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "type" "AreaAffectedType" NOT NULL,

    CONSTRAINT "AreaAffected_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenericRoomReading" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicId" TEXT NOT NULL,
    "type" "RoomReadingType" NOT NULL,
    "value" TEXT NOT NULL,
    "roomReadingId" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GenericRoomReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Detection" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT NOT NULL,
    "inferenceId" INTEGER NOT NULL,
    "imageKey" TEXT,
    "xMinCord" DOUBLE PRECISION,
    "yMinCord" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "xMaxCord" DOUBLE PRECISION,
    "yMaxCord" DOUBLE PRECISION,
    "projectId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "roomId" INTEGER,
    "dimension" INTEGER,
    "unit" "DimensionUnit",

    CONSTRAINT "Detection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatesUsed" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateCode" TEXT NOT NULL,
    "roomId" INTEGER,

    CONSTRAINT "TemplatesUsed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitList" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,

    CONSTRAINT "WaitList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RekognitionRuns" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RekognitionRuns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subject" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "projectId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "dynamicId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "remindClient" BOOLEAN NOT NULL DEFAULT false,
    "remindProjectOwners" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEventReminder" (
    "id" SERIAL NOT NULL,
    "reminderTarget" "ReminderTarget" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendText" BOOLEAN NOT NULL DEFAULT false,
    "sendEmail" BOOLEAN NOT NULL DEFAULT false,
    "textSentAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),
    "calendarEventId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEventReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" SERIAL NOT NULL,
    "xactimateKey" TEXT NOT NULL,
    "xactimateDescription" TEXT NOT NULL,
    "hasItems" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" SERIAL NOT NULL,
    "xactimateCode" TEXT NOT NULL,
    "xactimateDescription" TEXT NOT NULL,
    "unit" TEXT,
    "itemCategoryId" INTEGER NOT NULL,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatedItem" (
    "id" SERIAL NOT NULL,
    "relationId" TEXT NOT NULL,
    "lineItemId" INTEGER NOT NULL,

    CONSTRAINT "RelatedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlternateItem" (
    "id" SERIAL NOT NULL,
    "alternateId" TEXT NOT NULL,
    "lineItemId" INTEGER NOT NULL,

    CONSTRAINT "AlternateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanEntitlements" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extPlanId" TEXT NOT NULL,
    "maxImages" INTEGER NOT NULL,
    "maxProjects" INTEGER NOT NULL,
    "maxSeats" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PlanEntitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customers" (
    "id" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "billingAddress" JSONB,
    "paymentMethod" JSONB,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prices" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "unitAmount" BIGINT,
    "currency" TEXT NOT NULL,
    "type" "PricingType" NOT NULL,
    "interval" "PricingPlanInterval",
    "intervalCount" INTEGER,
    "trialPeriodDays" INTEGER,
    "metadata" JSONB,
    "description" TEXT NOT NULL,

    CONSTRAINT "Prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriptions" (
    "id" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "metadata" JSONB,
    "pricesId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL,
    "created" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodStart" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "cancelAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "trialStart" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "trialEnd" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_publicId_key" ON "Organization"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSavedOption_publicId_key" ON "OrganizationSavedOption"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToOrganization_userId_key" ON "UserToOrganization"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitation_invitationId_key" ON "OrganizationInvitation"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToProject_userId_projectId_key" ON "UserToProject"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_publicId_key" ON "Project"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyData_projectId_key" ON "PropertyData"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "DataDeletionRequest_email_key" ON "DataDeletionRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoAccessLink_accessId_key" ON "PhotoAccessLink"("accessId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_publicId_key" ON "Image"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_key_key" ON "Image"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Inference_publicId_key" ON "Inference"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Inference_imageId_key" ON "Inference"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Inference_imageKey_key" ON "Inference"("imageKey");

-- CreateIndex
CREATE UNIQUE INDEX "Room_publicId_key" ON "Room"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_projectId_name_key" ON "Room"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AreaAffected_type_roomId_key" ON "AreaAffected"("type", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Detection_publicId_key" ON "Detection"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Detection_projectId_category_code_roomId_key" ON "Detection"("projectId", "category", "code", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitList_email_key" ON "WaitList"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_publicId_key" ON "CalendarEvent"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_dynamicId_key" ON "CalendarEvent"("dynamicId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_xactimateKey_key" ON "ItemCategory"("xactimateKey");

-- CreateIndex
CREATE UNIQUE INDEX "LineItem_itemCategoryId_xactimateCode_key" ON "LineItem"("itemCategoryId", "xactimateCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customers_customerId_key" ON "Customers"("customerId");

-- AddForeignKey
ALTER TABLE "OrganizationSavedOption" ADD CONSTRAINT "OrganizationSavedOption_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToOrganization" ADD CONSTRAINT "UserToOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToOrganization" ADD CONSTRAINT "UserToOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToProject" ADD CONSTRAINT "UserToProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToProject" ADD CONSTRAINT "UserToProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cost" ADD CONSTRAINT "Cost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyData" ADD CONSTRAINT "PropertyData_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoAccessLink" ADD CONSTRAINT "PhotoAccessLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inference" ADD CONSTRAINT "Inference_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inference" ADD CONSTRAINT "Inference_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inference" ADD CONSTRAINT "Inference_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomReading" ADD CONSTRAINT "RoomReading_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomReading" ADD CONSTRAINT "RoomReading_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotesAuditTrail" ADD CONSTRAINT "NotesAuditTrail_notesId_fkey" FOREIGN KEY ("notesId") REFERENCES "Notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaAffected" ADD CONSTRAINT "AreaAffected_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaAffected" ADD CONSTRAINT "AreaAffected_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericRoomReading" ADD CONSTRAINT "GenericRoomReading_roomReadingId_fkey" FOREIGN KEY ("roomReadingId") REFERENCES "RoomReading"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_inferenceId_fkey" FOREIGN KEY ("inferenceId") REFERENCES "Inference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detection" ADD CONSTRAINT "Detection_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatesUsed" ADD CONSTRAINT "TemplatesUsed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventReminder" ADD CONSTRAINT "CalendarEventReminder_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "CalendarEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_itemCategoryId_fkey" FOREIGN KEY ("itemCategoryId") REFERENCES "ItemCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedItem" ADD CONSTRAINT "RelatedItem_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LineItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlternateItem" ADD CONSTRAINT "AlternateItem_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LineItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customers" ADD CONSTRAINT "Customers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prices" ADD CONSTRAINT "Prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_pricesId_fkey" FOREIGN KEY ("pricesId") REFERENCES "Prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

