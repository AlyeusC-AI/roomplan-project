import { prisma } from '@restorationx/db'

const csv = require('csv-parser')
const fs = require('fs')

// model LineItem {
//     id                   Int          @id @default(autoincrement())
//     xactimateCategory    ItemCategory @relation(fields: [itemCategoryId], references: [id])
//     xactimateCode        String
//     xactimateDescription String
//     itemCategoryId       Int

//     @@unique([itemCategoryId, xactimateCode])
//   }
const lineItems: {
  xactimateCode: string
  xactimateDescription: string
  unit: string
}[] = []
const myArgs = process.argv.slice(2)

fs.createReadStream(myArgs[0])
  .pipe(csv())
  .on(
    'data',
    (row: {
      Category: string
      Code: string
      Description: string
      Unit: string
    }) => {
      const { Code, Description, Unit } = row
      lineItems.push({
        xactimateCode: Code,
        xactimateDescription: Description,
        unit: Unit,
      })
    }
  )
  .on('end', async () => {
    const itemCategory = await prisma.itemCategory.findFirst({
      where: {
        xactimateKey: myArgs[1],
      },
    })
    if (!itemCategory) return
    const lineItemsWithCategory = lineItems.map((l) => ({
      ...l,
      itemCategoryId: itemCategory.id,
    }))
    await prisma.lineItem.createMany({
      data: lineItemsWithCategory,
      skipDuplicates: true,
    })
  })
