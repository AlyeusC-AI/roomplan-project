import prisma from "@servicegeek/db";
import superjson from "superjson";

export async function fetchUserProjectsFromOrg(orgId: number) {
  let projects = await prisma.project.findMany({
    select: {},
    where: {
      organizationId: orgId,
    },
  });

  let totalProjects = 0;
  totalProjects = user.org.organization._count.projects;
  projects = superjson.serialize(orgWithProjects)
    .json as unknown as ProjectType[];

  console.log("projects", projects);
}
