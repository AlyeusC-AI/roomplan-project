export interface CalendarEvent {
  id: string;
  subject: string;
  description?: string;
  date: string;
  start: string;
  end: string;
  remindClient: boolean;
  remindProjectOwners: boolean;
  reminderTime?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  organizationId: string;
}

export interface CreateCalendarEventDto {
  subject: string;
  description?: string;
  date: string;
  start: string;
  end: string;
  remindClient?: boolean;
  remindProjectOwners?: boolean;
  reminderTime?: string;
  projectId?: string;
  //   organizationId: string;
}

export interface UpdateCalendarEventDto {
  subject?: string;
  description?: string;
  date?: string;
  start?: string;
  end?: string;
  remindClient?: boolean;
  remindProjectOwners?: boolean;
  reminderTime?: string;
  projectId?: string;
}
