
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum
} = require('./runtime/index-browser')


const Prisma = {}

exports.Prisma = Prisma

/**
 * Prisma Client JS version: 4.13.0
 * Query Engine version: 1e7af066ee9cb95cf3a403c78d9aab3e6b04f37a
 */
Prisma.prismaVersion = {
  client: "4.13.0",
  engine: "1e7af066ee9cb95cf3a403c78d9aab3e6b04f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.validator = () => (val) => val


/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.AlternateItemOrderByRelevanceFieldEnum = {
  alternateId: 'alternateId'
};

exports.Prisma.AlternateItemScalarFieldEnum = {
  id: 'id',
  alternateId: 'alternateId',
  lineItemId: 'lineItemId'
};

exports.Prisma.AnnotationOrderByRelevanceFieldEnum = {
  userId: 'userId'
};

exports.Prisma.AnnotationScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  imageId: 'imageId',
  coordinates: 'coordinates',
  userId: 'userId',
  isDeleted: 'isDeleted'
};

exports.Prisma.AreaAffectedOrderByRelevanceFieldEnum = {
  material: 'material',
  totalAreaRemoved: 'totalAreaRemoved',
  totalAreaMicrobialApplied: 'totalAreaMicrobialApplied',
  cause: 'cause',
  cabinetryRemoved: 'cabinetryRemoved',
  publicId: 'publicId'
};

exports.Prisma.AreaAffectedScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  date: 'date',
  roomId: 'roomId',
  material: 'material',
  totalAreaRemoved: 'totalAreaRemoved',
  totalAreaMicrobialApplied: 'totalAreaMicrobialApplied',
  cause: 'cause',
  category: 'category',
  cabinetryRemoved: 'cabinetryRemoved',
  isDeleted: 'isDeleted',
  publicId: 'publicId',
  projectId: 'projectId',
  type: 'type'
};

exports.Prisma.CalendarEventOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  subject: 'subject',
  payload: 'payload',
  dynamicId: 'dynamicId'
};

exports.Prisma.CalendarEventReminderScalarFieldEnum = {
  id: 'id',
  reminderTarget: 'reminderTarget',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  sendText: 'sendText',
  sendEmail: 'sendEmail',
  textSentAt: 'textSentAt',
  emailSentAt: 'emailSentAt',
  calendarEventId: 'calendarEventId',
  date: 'date'
};

exports.Prisma.CalendarEventScalarFieldEnum = {
  id: 'id',
  publicId: 'publicId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  subject: 'subject',
  payload: 'payload',
  projectId: 'projectId',
  date: 'date',
  dynamicId: 'dynamicId',
  isDeleted: 'isDeleted',
  remindClient: 'remindClient',
  remindProjectOwners: 'remindProjectOwners'
};

exports.Prisma.CostOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.CostScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  estimatedCost: 'estimatedCost',
  actualCost: 'actualCost',
  name: 'name',
  projectId: 'projectId',
  isDeleted: 'isDeleted',
  type: 'type'
};

exports.Prisma.CustomersOrderByRelevanceFieldEnum = {
  customerId: 'customerId'
};

exports.Prisma.CustomersScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  billingAddress: 'billingAddress',
  paymentMethod: 'paymentMethod',
  organizationId: 'organizationId'
};

exports.Prisma.DataDeletionRequestOrderByRelevanceFieldEnum = {
  fullName: 'fullName',
  email: 'email'
};

exports.Prisma.DataDeletionRequestScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  fullName: 'fullName',
  email: 'email',
  isVerified: 'isVerified'
};

exports.Prisma.DetectionOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  imageKey: 'imageKey',
  category: 'category',
  code: 'code',
  item: 'item',
  quality: 'quality'
};

exports.Prisma.DetectionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  publicId: 'publicId',
  inferenceId: 'inferenceId',
  imageKey: 'imageKey',
  xMinCord: 'xMinCord',
  yMinCord: 'yMinCord',
  confidence: 'confidence',
  xMaxCord: 'xMaxCord',
  yMaxCord: 'yMaxCord',
  projectId: 'projectId',
  category: 'category',
  code: 'code',
  item: 'item',
  quality: 'quality',
  roomId: 'roomId',
  dimension: 'dimension',
  unit: 'unit'
};

exports.Prisma.EquipmentOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  name: 'name'
};

exports.Prisma.EquipmentScalarFieldEnum = {
  id: 'id',
  publicId: 'publicId',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  name: 'name',
  quantity: 'quantity',
  organizationId: 'organizationId'
};

exports.Prisma.GenericRoomReadingOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  value: 'value',
  humidity: 'humidity',
  temperature: 'temperature',
  gpp: 'gpp'
};

exports.Prisma.GenericRoomReadingScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  publicId: 'publicId',
  type: 'type',
  value: 'value',
  humidity: 'humidity',
  temperature: 'temperature',
  gpp: 'gpp',
  roomReadingId: 'roomReadingId',
  isDeleted: 'isDeleted'
};

exports.Prisma.ImageNoteOrderByRelevanceFieldEnum = {
  body: 'body',
  mentions: 'mentions',
  userId: 'userId'
};

exports.Prisma.ImageNoteScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  imageId: 'imageId',
  body: 'body',
  mentions: 'mentions',
  userId: 'userId',
  isDeleted: 'isDeleted'
};

exports.Prisma.ImageOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  key: 'key',
  description: 'description'
};

exports.Prisma.ImageScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  publicId: 'publicId',
  key: 'key',
  projectId: 'projectId',
  organizationId: 'organizationId',
  includeInReport: 'includeInReport',
  description: 'description'
};

exports.Prisma.InferenceOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  imageKey: 'imageKey'
};

exports.Prisma.InferenceScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  publicId: 'publicId',
  imageId: 'imageId',
  imageKey: 'imageKey',
  projectId: 'projectId',
  roomId: 'roomId'
};

exports.Prisma.ItemCategoryOrderByRelevanceFieldEnum = {
  xactimateKey: 'xactimateKey',
  xactimateDescription: 'xactimateDescription'
};

exports.Prisma.ItemCategoryScalarFieldEnum = {
  id: 'id',
  xactimateKey: 'xactimateKey',
  xactimateDescription: 'xactimateDescription',
  hasItems: 'hasItems'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.LineItemOrderByRelevanceFieldEnum = {
  xactimateCode: 'xactimateCode',
  xactimateDescription: 'xactimateDescription',
  unit: 'unit'
};

exports.Prisma.LineItemScalarFieldEnum = {
  id: 'id',
  xactimateCode: 'xactimateCode',
  xactimateDescription: 'xactimateDescription',
  unit: 'unit',
  itemCategoryId: 'itemCategoryId'
};

exports.Prisma.NotesAuditTrailOrderByRelevanceFieldEnum = {
  userId: 'userId',
  userName: 'userName',
  body: 'body'
};

exports.Prisma.NotesAuditTrailScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  notesId: 'notesId',
  userId: 'userId',
  userName: 'userName',
  action: 'action',
  body: 'body'
};

exports.Prisma.NotesOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  body: 'body'
};

exports.Prisma.NotesScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  date: 'date',
  roomId: 'roomId',
  isDeleted: 'isDeleted',
  publicId: 'publicId',
  projectId: 'projectId',
  body: 'body'
};

exports.Prisma.NotificationOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  title: 'title',
  content: 'content',
  link: 'link',
  linkText: 'linkText',
  userId: 'userId'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  publicId: 'publicId',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  title: 'title',
  content: 'content',
  isSeen: 'isSeen',
  link: 'link',
  linkText: 'linkText',
  type: 'type',
  userId: 'userId'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.OrganizationInvitationOrderByRelevanceFieldEnum = {
  email: 'email',
  invitationId: 'invitationId'
};

exports.Prisma.OrganizationInvitationScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  organizationId: 'organizationId',
  email: 'email',
  invitationId: 'invitationId',
  isAccepted: 'isAccepted'
};

exports.Prisma.OrganizationOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  name: 'name',
  address: 'address',
  faxNumber: 'faxNumber',
  size: 'size',
  logoId: 'logoId'
};

exports.Prisma.OrganizationSavedOptionOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  label: 'label',
  value: 'value'
};

exports.Prisma.OrganizationSavedOptionScalarFieldEnum = {
  id: 'id',
  publicId: 'publicId',
  createdAt: 'createdAt',
  label: 'label',
  value: 'value',
  isDeleted: 'isDeleted',
  type: 'type',
  organizationId: 'organizationId'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  publicId: 'publicId',
  createdAt: 'createdAt',
  name: 'name',
  address: 'address',
  faxNumber: 'faxNumber',
  size: 'size',
  isDeleted: 'isDeleted',
  updatedAt: 'updatedAt',
  logoId: 'logoId'
};

exports.Prisma.PendingRoofReportsScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  projectId: 'projectId',
  isCompleted: 'isCompleted'
};

exports.Prisma.PhotoAccessLinkOrderByRelevanceFieldEnum = {
  accessId: 'accessId',
  email: 'email',
  phoneNumber: 'phoneNumber'
};

exports.Prisma.PhotoAccessLinkScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  accessId: 'accessId',
  email: 'email',
  phoneNumber: 'phoneNumber',
  projectId: 'projectId'
};

exports.Prisma.PlanEntitlementsOrderByRelevanceFieldEnum = {
  extPlanId: 'extPlanId',
  description: 'description',
  period: 'period'
};

exports.Prisma.PlanEntitlementsScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  extPlanId: 'extPlanId',
  maxImages: 'maxImages',
  maxProjects: 'maxProjects',
  maxSeats: 'maxSeats',
  description: 'description',
  period: 'period',
  price: 'price'
};

exports.Prisma.PricesOrderByRelevanceFieldEnum = {
  id: 'id',
  productId: 'productId',
  currency: 'currency',
  description: 'description'
};

exports.Prisma.PricesScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  active: 'active',
  unitAmount: 'unitAmount',
  currency: 'currency',
  type: 'type',
  interval: 'interval',
  intervalCount: 'intervalCount',
  trialPeriodDays: 'trialPeriodDays',
  metadata: 'metadata',
  description: 'description'
};

exports.Prisma.ProductsOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  image: 'image'
};

exports.Prisma.ProductsScalarFieldEnum = {
  id: 'id',
  active: 'active',
  name: 'name',
  description: 'description',
  image: 'image',
  metadata: 'metadata'
};

exports.Prisma.ProjectEquipmentOrderByRelevanceFieldEnum = {
  publicId: 'publicId'
};

exports.Prisma.ProjectEquipmentScalarFieldEnum = {
  id: 'id',
  publicId: 'publicId',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  quantity: 'quantity',
  projectId: 'projectId',
  equipmentId: 'equipmentId'
};

exports.Prisma.ProjectNotesOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  body: 'body',
  mentions: 'mentions',
  userId: 'userId'
};

exports.Prisma.ProjectNotesScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  date: 'date',
  isDeleted: 'isDeleted',
  publicId: 'publicId',
  projectId: 'projectId',
  body: 'body',
  mentions: 'mentions',
  userId: 'userId'
};

exports.Prisma.ProjectOrderByRelevanceFieldEnum = {
  assignmentNumber: 'assignmentNumber',
  publicId: 'publicId',
  name: 'name',
  location: 'location',
  clientName: 'clientName',
  clientEmail: 'clientEmail',
  clientPhoneNumber: 'clientPhoneNumber',
  companyName: 'companyName',
  managerName: 'managerName',
  adjusterEmail: 'adjusterEmail',
  adjusterName: 'adjusterName',
  adjusterPhoneNumber: 'adjusterPhoneNumber',
  insuranceCompanyName: 'insuranceCompanyName',
  insuranceClaimId: 'insuranceClaimId',
  lossType: 'lossType',
  humidity: 'humidity',
  temperature: 'temperature',
  wind: 'wind',
  lat: 'lat',
  lng: 'lng',
  forecast: 'forecast',
  claimSummary: 'claimSummary'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  closedAt: 'closedAt',
  isDeleted: 'isDeleted',
  organizationId: 'organizationId',
  assignmentNumber: 'assignmentNumber',
  publicId: 'publicId',
  name: 'name',
  location: 'location',
  clientName: 'clientName',
  clientEmail: 'clientEmail',
  clientPhoneNumber: 'clientPhoneNumber',
  companyName: 'companyName',
  managerName: 'managerName',
  adjusterEmail: 'adjusterEmail',
  adjusterName: 'adjusterName',
  adjusterPhoneNumber: 'adjusterPhoneNumber',
  insuranceCompanyName: 'insuranceCompanyName',
  insuranceClaimId: 'insuranceClaimId',
  lossType: 'lossType',
  catCode: 'catCode',
  humidity: 'humidity',
  lastTimeWeatherFetched: 'lastTimeWeatherFetched',
  temperature: 'temperature',
  wind: 'wind',
  lat: 'lat',
  lng: 'lng',
  forecast: 'forecast',
  claimSummary: 'claimSummary',
  roofSegments: 'roofSegments',
  roofSpecs: 'roofSpecs',
  rcvValue: 'rcvValue',
  actualValue: 'actualValue',
  status: 'status',
  projectStatusValueId: 'projectStatusValueId'
};

exports.Prisma.ProjectStatusValueOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  label: 'label',
  description: 'description',
  color: 'color'
};

exports.Prisma.ProjectStatusValueScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  publicId: 'publicId',
  label: 'label',
  description: 'description',
  color: 'color',
  order: 'order',
  organizationId: 'organizationId'
};

exports.Prisma.PropertyDataOrderByRelevanceFieldEnum = {
  realtyMoleId: 'realtyMoleId'
};

exports.Prisma.PropertyDataScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  projectId: 'projectId',
  bathrooms: 'bathrooms',
  bedrooms: 'bedrooms',
  squareFootage: 'squareFootage',
  realtyMoleId: 'realtyMoleId',
  data: 'data'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.RekognitionRunsScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt'
};

exports.Prisma.RelatedItemOrderByRelevanceFieldEnum = {
  relationId: 'relationId'
};

exports.Prisma.RelatedItemScalarFieldEnum = {
  id: 'id',
  relationId: 'relationId',
  lineItemId: 'lineItemId'
};

exports.Prisma.RoomOrderByRelevanceFieldEnum = {
  publicId: 'publicId',
  name: 'name',
  gpp: 'gpp',
  humidity: 'humidity',
  dehuReading: 'dehuReading',
  temperature: 'temperature',
  length: 'length',
  width: 'width',
  height: 'height',
  totalSqft: 'totalSqft',
  equipmentUsed: 'equipmentUsed'
};

exports.Prisma.RoomReadingOrderByRelevanceFieldEnum = {
  humidity: 'humidity',
  temperature: 'temperature',
  moistureContentWall: 'moistureContentWall',
  moistureContentFloor: 'moistureContentFloor',
  equipmentUsed: 'equipmentUsed',
  publicId: 'publicId',
  gpp: 'gpp'
};

exports.Prisma.RoomReadingScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  date: 'date',
  humidity: 'humidity',
  temperature: 'temperature',
  moistureContentWall: 'moistureContentWall',
  moistureContentFloor: 'moistureContentFloor',
  equipmentUsed: 'equipmentUsed',
  roomId: 'roomId',
  isDeleted: 'isDeleted',
  publicId: 'publicId',
  projectId: 'projectId',
  gpp: 'gpp'
};

exports.Prisma.RoomScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  publicId: 'publicId',
  name: 'name',
  projectId: 'projectId',
  gpp: 'gpp',
  humidity: 'humidity',
  dehuReading: 'dehuReading',
  temperature: 'temperature',
  length: 'length',
  width: 'width',
  height: 'height',
  totalSqft: 'totalSqft',
  windows: 'windows',
  doors: 'doors',
  equipmentUsed: 'equipmentUsed'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.SubscriptionsOrderByRelevanceFieldEnum = {
  id: 'id',
  pricesId: 'pricesId'
};

exports.Prisma.SubscriptionsScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  status: 'status',
  metadata: 'metadata',
  pricesId: 'pricesId',
  quantity: 'quantity',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  created: 'created',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  endedAt: 'endedAt',
  cancelAt: 'cancelAt',
  canceledAt: 'canceledAt',
  trialStart: 'trialStart',
  trialEnd: 'trialEnd'
};

exports.Prisma.TemplatesUsedOrderByRelevanceFieldEnum = {
  templateCode: 'templateCode'
};

exports.Prisma.TemplatesUsedScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  templateCode: 'templateCode',
  roomId: 'roomId'
};

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  id: 'id',
  token: 'token',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  inviteId: 'inviteId'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  token: 'token',
  createdAt: 'createdAt',
  email: 'email',
  isDeleted: 'isDeleted',
  updatedAt: 'updatedAt',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  inviteId: 'inviteId',
  isSupportUser: 'isSupportUser',
  hasSeenProductTour: 'hasSeenProductTour',
  productTourData: 'productTourData',
  savedDashboardView: 'savedDashboardView',
  photoView: 'photoView',
  groupView: 'groupView',
  onboardingStatus: 'onboardingStatus'
};

exports.Prisma.UserToOrganizationOrderByRelevanceFieldEnum = {
  role: 'role',
  userId: 'userId'
};

exports.Prisma.UserToOrganizationScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isAdmin: 'isAdmin',
  isDeleted: 'isDeleted',
  organizationId: 'organizationId',
  role: 'role',
  accessLevel: 'accessLevel',
  userId: 'userId'
};

exports.Prisma.UserToProjectOrderByRelevanceFieldEnum = {
  userId: 'userId'
};

exports.Prisma.UserToProjectScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  userId: 'userId',
  projectId: 'projectId'
};

exports.Prisma.WaitListOrderByRelevanceFieldEnum = {
  email: 'email'
};

exports.Prisma.WaitListScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  email: 'email'
};

exports.Prisma.WeatherReportItemOrderByRelevanceFieldEnum = {
  time: 'time',
  f_scale: 'f_scale',
  speed: 'speed',
  size: 'size',
  location: 'location',
  county: 'county',
  state: 'state',
  lat: 'lat',
  lon: 'lon',
  comments: 'comments'
};

exports.Prisma.WeatherReportItemScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  projectId: 'projectId',
  date: 'date',
  time: 'time',
  f_scale: 'f_scale',
  speed: 'speed',
  size: 'size',
  location: 'location',
  county: 'county',
  state: 'state',
  lat: 'lat',
  lon: 'lon',
  comments: 'comments'
};
exports.AccessLevel = {
  admin: 'admin',
  viewer: 'viewer',
  projectManager: 'projectManager',
  accountManager: 'accountManager',
  contractor: 'contractor'
};

exports.AreaAffectedType = {
  wall: 'wall',
  ceiling: 'ceiling',
  floor: 'floor'
};

exports.CostType = {
  subcontractor: 'subcontractor',
  miscellaneous: 'miscellaneous',
  materials: 'materials',
  labor: 'labor'
};

exports.DashboardViews = {
  listView: 'listView',
  boardView: 'boardView',
  mapView: 'mapView'
};

exports.DimensionUnit = {
  sf: 'sf',
  lf: 'lf',
  ea: 'ea'
};

exports.GroupByViews = {
  roomView: 'roomView',
  dateView: 'dateView'
};

exports.NotesAuditAction = {
  updated: 'updated',
  deleted: 'deleted',
  created: 'created'
};

exports.NotificationType = {
  notification: 'notification',
  activity: 'activity'
};

exports.PhotoViews = {
  photoListView: 'photoListView',
  photoGridView: 'photoGridView'
};

exports.PricingPlanInterval = {
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year'
};

exports.PricingType = {
  one_time: 'one_time',
  recurring: 'recurring'
};

exports.ProjectStatus = {
  active: 'active',
  mitigation: 'mitigation',
  inspection: 'inspection',
  review: 'review',
  completed: 'completed',
  inactive: 'inactive',
  incomplete: 'incomplete'
};

exports.ReminderTarget = {
  client: 'client',
  allAssigned: 'allAssigned',
  projectCreator: 'projectCreator'
};

exports.RoomReadingType = {
  dehumidifer: 'dehumidifer'
};

exports.SavedOptionType = {
  carrier: 'carrier',
  wallMaterial: 'wallMaterial',
  floorMaterial: 'floorMaterial'
};

exports.SubscriptionStatus = {
  trialing: 'trialing',
  active: 'active',
  canceled: 'canceled',
  incomplete: 'incomplete',
  incomplete_expired: 'incomplete_expired',
  past_due: 'past_due',
  unpaid: 'unpaid'
};

exports.Prisma.ModelName = {
  User: 'User',
  Organization: 'Organization',
  Equipment: 'Equipment',
  Notification: 'Notification',
  OrganizationSavedOption: 'OrganizationSavedOption',
  UserToOrganization: 'UserToOrganization',
  OrganizationInvitation: 'OrganizationInvitation',
  UserToProject: 'UserToProject',
  Project: 'Project',
  ProjectNotes: 'ProjectNotes',
  ProjectStatusValue: 'ProjectStatusValue',
  PendingRoofReports: 'PendingRoofReports',
  WeatherReportItem: 'WeatherReportItem',
  ProjectEquipment: 'ProjectEquipment',
  Cost: 'Cost',
  PropertyData: 'PropertyData',
  DataDeletionRequest: 'DataDeletionRequest',
  PhotoAccessLink: 'PhotoAccessLink',
  Image: 'Image',
  Annotation: 'Annotation',
  ImageNote: 'ImageNote',
  Inference: 'Inference',
  Room: 'Room',
  RoomReading: 'RoomReading',
  Notes: 'Notes',
  NotesAuditTrail: 'NotesAuditTrail',
  AreaAffected: 'AreaAffected',
  GenericRoomReading: 'GenericRoomReading',
  Detection: 'Detection',
  TemplatesUsed: 'TemplatesUsed',
  WaitList: 'WaitList',
  RekognitionRuns: 'RekognitionRuns',
  CalendarEvent: 'CalendarEvent',
  CalendarEventReminder: 'CalendarEventReminder',
  ItemCategory: 'ItemCategory',
  LineItem: 'LineItem',
  RelatedItem: 'RelatedItem',
  AlternateItem: 'AlternateItem',
  PlanEntitlements: 'PlanEntitlements',
  Customers: 'Customers',
  Products: 'Products',
  Prices: 'Prices',
  Subscriptions: 'Subscriptions'
};

/**
 * Create the Client
 */
class PrismaClient {
  constructor() {
    throw new Error(
      `PrismaClient is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
    )
  }
}
exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
