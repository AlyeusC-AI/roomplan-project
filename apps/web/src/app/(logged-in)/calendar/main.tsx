"use client";

import { useEffect, useState } from "react";
import {
  Assignee,
  ProjectType,
} from "@servicegeek/db/queries/project/listProjects";
import { Project } from "@servicegeek/db";

// import 'react-datepicker/dist/react-datepicker.css'
import { exampleFeatures } from "../settings/equipment/table";
import { projectsStore } from "@atoms/projects";
import CalendarComponent from "@components/calendar";

export interface InviteStatus {
  accepted: boolean;
  organizationName: string;
  inviteId: string;
}

const CalendarPage = () => {
  const { projects } = projectsStore((state) => state);

  const allAssigness =
    projects
      ?.map((project) => project.projectAssignees)
      ?.flat()
      ?.filter((v, i, a) => a.findIndex((t) => t.userId === v.userId) === i)
      ?.map((assignee) => assignee) ?? [];

  const [currentAssignees, setCurrentAssignees] = useState<Assignee[]>([]);
  const [isCreateCalenderEventModalOpen, setIsCreateCalenderEventModalOpen] =
    useState(false);

  const [existingCalenderEventSelected, setExistingCalenderEventSelected] =
    useState<{
      isDeleted: boolean;
      publicId: string;
      projectId: number | null;
      subject: string;
      payload: string;
      project: Project | null;
      date: Date;
      dynamicId: string;
    }>();

  const handleEventClick = (clickInfo: any, projs: ProjectType[]) => {
    const existingEvent = allEvents?.find(
      (event) => event?.publicId === clickInfo.event._def.publicId
    );

    setExistingCalenderEventSelected(existingEvent);
    setCurrentAssignees(
      projs?.find((p) => p.publicId === existingEvent?.project?.publicId)
        ?.projectAssignees || []
    );
    setIsCreateCalenderEventModalOpen(true);
  };

  useEffect(() => {
    fetch("/api/v1/projects")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  });

  return <CalendarComponent />;
};

export default CalendarPage;
