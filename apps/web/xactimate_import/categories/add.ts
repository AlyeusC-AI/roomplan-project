import { prisma } from '@restorationx/db'

const csv = require('csv-parser')
const fs = require('fs')

// model ItemCategory {
//   id                   Int               @id @default(autoincrement())
//   xactimateKey         String            @unique
//   xactimateDescription String
//   itemCodes            ItemCode[]
//   ItemDescription      ItemDescription[]
// }

const categories: { xactimateKey: string; xactimateDescription: string }[] = []
fs.createReadStream('./data.csv')
  .pipe(csv())
  .on('data', (row: { Category: string; Description: string }) => {
    const { Category, Description } = row
    console.log(Category, Description)
    categories.push({
      xactimateKey: Category.trim(),
      xactimateDescription: Description.trim(),
    })
  })
  .on('end', async () => {
    await prisma.itemCategory.createMany({
      data: categories,
      skipDuplicates: true,
    })
  })
