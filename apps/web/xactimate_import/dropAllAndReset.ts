import { prisma } from '@restorationx/db'

const run = async () => {
  await prisma.relatedItem.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  })
  await prisma.alternateItem.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  })
  await prisma.lineItem.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  })
  await prisma.itemCategory.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  })
}

run()
