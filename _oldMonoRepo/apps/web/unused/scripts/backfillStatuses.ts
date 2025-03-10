import prisma from '@servicegeek/db'
import { v4 } from 'uuid'

const main = async () => {
  const projects = await prisma.project.findMany({
    where: {
      projectStatusValueId: null,
    },
  })
  console.log(`Running backfill on ${projects.length} projects`)
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]
    if (!project.status) {
      continue
    }
    const projectStatusValue = await prisma.projectStatusValue.findFirst({
      where: {
        label: project.status,
        organizationId: project.organizationId,
      },
    })

    if (!projectStatusValue) {
      console.log(
        `Did not find a project status value of ${project.status} for org ${project.organizationId}`
      )
      const newProjectStatusValue = await prisma.projectStatusValue.create({
        data: {
          label: project.status,
          organizationId: project.organizationId,
          publicId: v4(),
          color: 'Blue',
          description: project.status,
        },
      })
      await prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          projectStatusValueId: newProjectStatusValue.id,
        },
      })
    } else {
      await prisma.project.update({
        where: {
          id: project.id,
        },
        data: {
          projectStatusValueId: projectStatusValue.id,
        },
      })
    }
  }
  console.log(`Backfill completed.`)
}

main()
