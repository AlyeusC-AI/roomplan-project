const csv = require('csv-parser')
const fs = require('fs')

const catSelMap = {}
const catToSel = {}

const updateMapping = (items) => {
  for (const item of items) {
    catSelMap[`${item.cat}-${item.sel}`] = items
    if (!catToSel[item.cat]) {
      catToSel[item.cat] = [item.sel]
    } else if (!catToSel[item.cat].find((s) => s === item.sel)) {
      catToSel[item.cat] = [...catToSel[item.cat], item.sel]
    }
  }
  //   console.log(catSelMap)
}

const startParse = () => {
  const data = {}
  let items = []

  fs.createReadStream('./related.csv')
    .pipe(csv())
    .on('data', (row) => {
      const { Category, Selection, Description } = row

      // Reset on new detection
      if (!Category || Category === '') {
        // console.log('Processing   ', items)
        updateMapping(items)
        items = []
        return
      }

      // Push item into array
      items.push({
        cat: Category,
        sel: Selection,
        description: Description,
      })
    })
    .on('end', () => {
      if (items.length > 0) {
        updateMapping(items)
      }
      fs.writeFile(
        '../../lib/itemOptions.json',
        JSON.stringify(catSelMap),
        (err) => {
          if (err) {
            throw err
          }
          console.log('JSON data is saved.')
        }
      )

      console.log(catToSel)

      fs.writeFile(
        '../../lib/categoriesToSelections.json',
        JSON.stringify(catToSel),
        (err) => {
          if (err) {
            throw err
          }
          console.log('JSON data is saved.')
        }
      )
    })
}

startParse()
