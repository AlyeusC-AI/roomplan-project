import { prisma } from '@restorationx/db'

import collectPropertyData from '@lib/realty-mole/collectPropertyData'
import { verifySignature } from '@upstash/qstash/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { projectId } = JSON.parse(req.body)
  let now,
    end = 0
  now = performance.now()

  try {
    const project = await prisma.project.findFirst({
      where: {
        publicId: projectId,
      },
    })
    if (!project) {
      res.status(200).send('ok')
      return
    }
    const propertyData = await collectPropertyData(project?.location)
    const createPropertyData = prisma.propertyData.create({
      data: {
        projectId: project.id,
        bathrooms: propertyData?.bathrooms,
        bedrooms: propertyData?.bedrooms,
        squareFootage: propertyData?.squareFootage,
        data: propertyData || {},
      },
    })
    const bathrooms = []
    if (propertyData?.bathrooms && propertyData.bathrooms > 0) {
      for (let i = 0; i < Math.ceil(propertyData.bathrooms); i++) {
        bathrooms.push({
          publicId: uuidv4(),
          projectId: project.id,
          name: i === 0 ? 'Bathroom' : `Bathroom ${i + 1}`,
        })
      }
    }
    const bedrooms = []
    if (propertyData?.bedrooms && propertyData.bedrooms > 0) {
      for (let i = 0; i < Math.ceil(propertyData.bedrooms); i++) {
        bedrooms.push({
          publicId: uuidv4(),
          projectId: project.id,
          name: i === 0 ? 'Bedroom' : `Bedroom ${i + 1}`,
        })
      }
    }

    const promises = []

    if (bathrooms.length > 0) {
      promises.push(
        prisma.room.createMany({
          data: bathrooms,
        })
      )
    }
    if (bedrooms.length > 0) {
      promises.push(
        prisma.room.createMany({
          data: bedrooms,
        })
      )
    }

    await prisma.$transaction([createPropertyData, ...promises])
    end = performance.now()
    console.log(`Property Data collection took ${end - now} ms`)
    res.status(200).send('ok')
    return
  } catch (e) {
    res.status(500).send('failed')
    return
  }
}

async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}

export default verifySignature(Route)

export const config = {
  api: {
    bodyParser: false,
  },
}
