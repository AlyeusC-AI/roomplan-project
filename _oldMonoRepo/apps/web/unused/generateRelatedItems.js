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
}

const startParse = () => {
  const data = {}
  let items = []
  let doneWithAlts = false

  fs.createReadStream('./related_items.csv')
    .pipe(csv())
    .on('data', (row) => {
      const { Category, Code, Item } = row

      // // We hit the related line items.
      // if (Detected.indexOf('Related') >= 0) {
      //   doneWithAlts = true
      //   return
      // }
      // Skip empty lines
      if (!Category || Category === '') {
        return
      }

      // do nothing if we encounter "Alternate"
      if (
        Category.indexOf('Alternate') >= 0 ||
        Category.indexOf('Alternative') >= 0 ||
        Category.indexOf('Related') >= 0
      )
        return

      // Reset on new detection
      if (Category === 'Category') {
        // console.log('Processing   ', items)
        updateMapping(items)
        items = []
        // doneWithAlts = false
        return
      }

      // Push item into array
      // if (!doneWithAlts) {
      items.push({
        cat: Category,
        sel: Code,
        description: Item,
      })
      // }
    })
    .on('end', () => {
      if (items.length > 0) {
        updateMapping(items)
      }
      fs.writeFile(
        '../lib/itemOptions.json',
        JSON.stringify(catSelMap),
        (err) => {
          if (err) {
            throw err
          }
          console.log('JSON data is saved.')
        }
      )

      fs.writeFile(
        '../lib/categoriesToSelections.json',
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
