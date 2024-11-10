import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@servicegeek/db'

let lineItems: {
  itemCategoryId: number
  xactimateCode: string
  xactimateDescription: string
  unit: string
}[] = []

const csv = require('csvtojson')
const csvFilePath = 'alternates.csv'

const run = async () => {
  const array = (await csv().fromFile(csvFilePath)) as {
    Category: string
    Selection: string
    Description: string
  }[]
  console.log('Dropping table and re-creating alternates')
  await prisma.alternateItem.deleteMany({
    where: {
      id: {
        gt: 0,
      },
    },
  })
  for (const row of array) {
    const { Category, Selection, Description } = row
    // Have a row, push it into the lineItems array. Also ensure db has entry for row
    if (Category) {
      const itemCategory = await prisma.itemCategory.findFirst({
        where: {
          xactimateKey: Category.trim(),
        },
      })
      if (!itemCategory) {
        console.log('No category found: ', Category.trim(), ' Creating')

        continue
      }
      if (!itemCategory.hasItems) {
        await prisma.itemCategory.update({
          where: {
            id: itemCategory.id,
          },
          data: {
            hasItems: true,
          },
        })
      }
      lineItems.push({
        itemCategoryId: itemCategory.id,
        xactimateCode: Selection.trim(),
        xactimateDescription: Description.trim(),
        unit: '',
      })
    } else {
      const alternateId = uuidv4()
      const promises = []
      for (const lineItem of lineItems) {
        let existingItem = await prisma.lineItem.findFirst({
          where: {
            xactimateCode: lineItem.xactimateCode,
            itemCategoryId: lineItem.itemCategoryId,
          },
        })
        if (!existingItem) {
          console.log(
            'Created new line item',
            lineItem.xactimateCode,
            lineItem.itemCategoryId
          )
          existingItem = await prisma.lineItem.create({
            data: {
              xactimateCode: lineItem.xactimateCode,
              xactimateDescription: lineItem.xactimateDescription,
              itemCategoryId: lineItem.itemCategoryId,
            },
          })
        }
        promises.push(
          prisma.alternateItem.create({
            data: {
              lineItemId: existingItem?.id,
              alternateId,
            },
          })
        )
      }
      const res = await prisma.$transaction(promises)
      console.log('Successfully grouped ', res.length, ' items')
      lineItems = []
    }
  }
}

run()
