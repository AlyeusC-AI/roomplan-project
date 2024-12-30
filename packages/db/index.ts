import { PrismaClient } from './prisma/src/generated/prisma'
export * from "./prisma/src/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "production") {
    console.log("setting production prisma");
    globalForPrisma.prisma = new PrismaClient();
  } else {
    if (!globalForPrisma.prisma) {
      console.log("setting development prisma");
      globalForPrisma.prisma = new PrismaClient();
    }
  }
}
export const prisma = globalForPrisma.prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
