"use client";

import { redirect, useParams } from "next/navigation";

export default function ProjectPage() {
  const { id } = useParams();
  return redirect(`/projects/${id}/overview`);
}
