"use client";

import CalendarComponent from "@components/calendar";
import { projectStore } from "@atoms/project";

export default function Calender() {
  const { project } = projectStore();

  return <CalendarComponent project={project} />;
}
