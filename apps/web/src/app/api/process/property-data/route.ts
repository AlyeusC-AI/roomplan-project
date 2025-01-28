import { prisma } from "@servicegeek/db";

import collectPropertyData from "@lib/realty-mole/collectPropertyData";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();
  let now,
    end = 0;
  now = performance.now();

  try {
    const project = await prisma.project.findFirst({
      where: {
        publicId: projectId,
      },
    });
    if (!project) {
      return NextResponse.json({ status: "ok" }, { status: 200 });
    }
    const propertyData = await collectPropertyData(project?.location);
    const createPropertyData = prisma.propertyData.create({
      data: {
        projectId: project.id,
        bathrooms: propertyData?.bathrooms,
        bedrooms: propertyData?.bedrooms,
        squareFootage: propertyData?.squareFootage,
        data: propertyData || {},
      },
    });
    const bathrooms = [];
    if (propertyData?.bathrooms && propertyData.bathrooms > 0) {
      for (let i = 0; i < Math.ceil(propertyData.bathrooms); i++) {
        bathrooms.push({
          publicId: uuidv4(),
          projectId: project.id,
          name: i === 0 ? "Bathroom" : `Bathroom ${i + 1}`,
        });
      }
    }
    const bedrooms = [];
    if (propertyData?.bedrooms && propertyData.bedrooms > 0) {
      for (let i = 0; i < Math.ceil(propertyData.bedrooms); i++) {
        bedrooms.push({
          publicId: uuidv4(),
          projectId: project.id,
          name: i === 0 ? "Bedroom" : `Bedroom ${i + 1}`,
        });
      }
    }

    const promises = [];

    if (bathrooms.length > 0) {
      promises.push(
        prisma.room.createMany({
          data: bathrooms,
        })
      );
    }
    if (bedrooms.length > 0) {
      promises.push(
        prisma.room.createMany({
          data: bedrooms,
        })
      );
    }

    await prisma.$transaction([createPropertyData, ...promises]);
    end = performance.now();
    console.log(`Property Data collection took ${end - now} ms`);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
