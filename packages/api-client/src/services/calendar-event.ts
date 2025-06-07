import type {
  CalendarEvent,
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from "../types/calendar-event";
import { apiClient } from "./client";

class CalendarEventService {
  async create(data: CreateCalendarEventDto & { organizationId: string }) {
    const response = await apiClient.post<CalendarEvent>(
      "/calendar-events",
      data
    );
    return response.data;
  }

  async findAll(
    organizationId: string,
    projectId?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const params = new URLSearchParams({ organizationId });
    if (projectId) {
      params.append("projectId", projectId);
    }
    if (startDate) {
      params.append("startDate", startDate.toISOString());
    }
    if (endDate) {
      params.append("endDate", endDate.toISOString());
    }
    const response = await apiClient.get<CalendarEvent[]>(
      `/calendar-events?${params.toString()}`
    );
    return response.data;
  }

  async findOne(id: string) {
    const response = await apiClient.get<CalendarEvent>(
      `/calendar-events/${id}`
    );
    return response.data;
  }

  async update(id: string, data: UpdateCalendarEventDto) {
    const response = await apiClient.patch<CalendarEvent>(
      `/calendar-events/${id}`,
      data
    );
    return response.data;
  }

  async remove(id: string) {
    const response = await apiClient.delete<CalendarEvent>(
      `/calendar-events/${id}`
    );
    return response.data;
  }
}

export const calendarEventService = new CalendarEventService();
