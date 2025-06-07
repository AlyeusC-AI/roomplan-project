import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { calendarEventService } from "../services/calendar-event";
import type {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  CalendarEvent,
} from "../types/calendar-event";
import { useAuthStore } from "../services/storage";
import { useActiveOrganization } from "./useOrganization";

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();
  const organizationId = org?.id!;

  return useMutation({
    mutationFn: (data: CreateCalendarEventDto) =>
      calendarEventService.create({ ...data, organizationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCalendarEventDto }) =>
      calendarEventService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useGetCalendarEvents(
  projectId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const org = useActiveOrganization();
  const organizationId = org?.id!;

  const options: UseQueryOptions<CalendarEvent[], Error> = {
    queryKey: [
      "calendar-events",
      organizationId,
      projectId,
      startDate?.toISOString(),
      endDate?.toISOString(),
    ],
    queryFn: async () => {
      const response = await calendarEventService.findAll(
        organizationId,
        projectId,
        startDate,
        endDate
      );
      return response;
    },
    enabled: !!organizationId && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetCalendarEvent(id: string) {
  return useQuery({
    queryKey: ["calendar-events", id],
    queryFn: () => calendarEventService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarEventService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}
